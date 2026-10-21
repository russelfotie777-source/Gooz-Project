<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockAdjustment\StoreStockAdjustmentRequest;
use App\Http\Requests\StockAdjustment\UpdateStockAdjustmentRequest;
use App\Http\Resources\StockAdjustmentResource;
use App\Models\InventoryLedger;
use App\Models\ProductVariant;
use App\Models\Stock;
use App\Models\StockAdjustment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StockAdjustmentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $adjustments = StockAdjustment::query()
            ->with(['warehouse:id,name', 'creator:id,name'])
            ->withCount('lines')
            ->when($request->query('warehouse_id'), fn ($q, $id) => $q->where('warehouse_id', $id))
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);

        return StockAdjustmentResource::collection($adjustments);
    }

    public function show(StockAdjustment $stockAdjustment): StockAdjustmentResource
    {
        return new StockAdjustmentResource(
            $stockAdjustment->load(['warehouse', 'creator', 'lines.product', 'lines.variant'])
        );
    }

    public function store(StoreStockAdjustmentRequest $request): StockAdjustmentResource
    {
        $data = $request->validated();

        $adjustment = DB::transaction(function () use ($data, $request) {
            $adjustment = StockAdjustment::create([
                'warehouse_id' => $data['warehouse_id'],
                'created_by' => $request->user()?->id,
                'type' => $data['type'] ?? 'rapide',
                'status' => 'brouillon',
                'motif' => $data['motif'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $adjustment->lines()->createMany($data['lines']);

            if ($data['status'] === 'appliqué') {
                $this->apply($adjustment);
            }

            return $adjustment;
        });

        return new StockAdjustmentResource(
            $adjustment->load(['warehouse', 'creator', 'lines.product', 'lines.variant'])
        );
    }

    /**
     * "Mettre tous les produits/variantes à X" — builds and immediately
     * applies one adjustment line per variant for the chosen warehouse, so
     * the shop owner doesn't have to pick every product/variant by hand one
     * line at a time the way the regular create form requires. Goes through
     * the exact same StockAdjustment + apply() path as a manual adjustment
     * (locking, InventoryLedger entries, 'appliqué' status) so a mass
     * equalize shows up in the inventory journal just like any other one.
     */
    public function bulkSet(Request $request): StockAdjustmentResource
    {
        $data = $request->validate([
            'warehouse_id' => ['required', 'integer', Rule::exists('warehouses', 'id')],
            'quantity' => ['required', 'integer', 'min:0'],
            'motif' => ['nullable', 'string', 'max:255'],
        ]);

        $variants = ProductVariant::query()->select('id', 'product_id')->get();

        $adjustment = DB::transaction(function () use ($data, $request, $variants) {
            // Snapshotting+computing the deltas BEFORE the transaction (the
            // previous version of this) meant a double-click on "Mettre à
            // X" computed the same deltas twice from the same stale
            // pre-click quantities — the second request's delta then landed
            // on top of the first's already-applied result instead of
            // actually converging on X, overshooting the target. Locking
            // the Stock rows for update first and computing deltas from
            // THAT snapshot means a second, overlapping call serializes
            // behind the first (same lockForUpdate the per-line apply()
            // below also takes — re-entrant within one transaction) and
            // then sees the already-updated quantities, computing a
            // (correctly near-zero) delta instead of repeating the first
            // one.
            $currentQuantities = Stock::query()
                ->where('warehouse_id', $data['warehouse_id'])
                ->whereIn('product_variant_id', $variants->pluck('id'))
                ->lockForUpdate()
                ->pluck('quantity_available', 'product_variant_id');

            $lines = $variants
                ->map(function (ProductVariant $variant) use ($currentQuantities, $data) {
                    $before = $currentQuantities->get($variant->id, 0);
                    $delta = $data['quantity'] - $before;

                    return $delta === 0 ? null : [
                        'product_id' => $variant->product_id,
                        'product_variant_id' => $variant->id,
                        'delta_quantity' => $delta,
                    ];
                })
                ->filter()
                ->values();

            $adjustment = StockAdjustment::create([
                'warehouse_id' => $data['warehouse_id'],
                'created_by' => $request->user()?->id,
                'type' => 'masse',
                'status' => 'brouillon',
                'motif' => $data['motif'] ?? "Mise à {$data['quantity']} unités — tous les produits",
            ]);

            if ($lines->isNotEmpty()) {
                $adjustment->lines()->createMany($lines->all());
                $this->apply($adjustment);
            } else {
                $adjustment->update(['status' => 'appliqué', 'applied_at' => now()]);
            }

            return $adjustment;
        });

        return new StockAdjustmentResource(
            $adjustment->load(['warehouse', 'creator', 'lines.product', 'lines.variant'])
        );
    }

    public function update(UpdateStockAdjustmentRequest $request, StockAdjustment $stockAdjustment): StockAdjustmentResource
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $stockAdjustment) {
            // Re-fetch and LOCK the adjustment row itself before trusting
            // its status. The $stockAdjustment the route bound is read
            // before this transaction even opens, so its ->status can
            // already be stale: two overlapping PUT requests for the same
            // adjustment (a double-click on "Appliquer" before the button
            // disables, or a retried request) would otherwise both read
            // status='brouillon', both pass the status check below, and
            // both call apply() — double-applying the same delta onto the
            // stock. Locking here is what actually serializes the second
            // request behind the first's full commit, so it re-reads
            // status='appliqué' and skips re-applying.
            $locked = StockAdjustment::query()->lockForUpdate()->findOrFail($stockAdjustment->id);

            $locked->update(collect($data)->except(['lines', 'status'])->all());

            if (array_key_exists('lines', $data)) {
                $locked->lines()->delete();
                $locked->lines()->createMany($data['lines']);
            }

            $wantsApply = ($data['status'] ?? $locked->status) === 'appliqué';

            if ($wantsApply && $locked->status !== 'appliqué') {
                $this->apply($locked->fresh('lines'));
            }
        });

        return new StockAdjustmentResource(
            $stockAdjustment->fresh(['warehouse', 'creator', 'lines.product', 'lines.variant'])
        );
    }

    public function destroy(StockAdjustment $stockAdjustment)
    {
        if ($stockAdjustment->status === 'appliqué') {
            throw ValidationException::withMessages([
                'status' => "Un ajustement déjà appliqué ne peut pas être supprimé.",
            ]);
        }

        $stockAdjustment->delete();

        return response()->json(null, 204);
    }

    /**
     * Commit the adjustment's line deltas into the stocks table, locking
     * each matching row so concurrent adjustments on the same
     * product/variant/warehouse can't race each other, and refusing any
     * line that would push quantity_available negative.
     */
    private function apply(StockAdjustment $adjustment): void
    {
        foreach ($adjustment->lines as $line) {
            $stock = Stock::query()
                ->where('product_id', $line->product_id)
                ->where('product_variant_id', $line->product_variant_id)
                ->where('warehouse_id', $adjustment->warehouse_id)
                ->lockForUpdate()
                ->first();

            $before = $stock->quantity_available ?? 0;
            $reserved = $stock->quantity_reserved ?? 0;
            $next = $before + $line->delta_quantity;

            if ($next < 0) {
                throw ValidationException::withMessages([
                    'lines' => "Stock insuffisant pour appliquer l'ajustement sur le produit #{$line->product_id}.",
                ]);
            }

            if ($stock) {
                $stock->update(['quantity_available' => $next]);
            } else {
                Stock::create([
                    'product_id' => $line->product_id,
                    'product_variant_id' => $line->product_variant_id,
                    'warehouse_id' => $adjustment->warehouse_id,
                    'quantity_available' => $next,
                ]);
            }

            InventoryLedger::create([
                'warehouse_id' => $adjustment->warehouse_id,
                'product_id' => $line->product_id,
                'product_variant_id' => $line->product_variant_id,
                'movement_type' => 'adjustment',
                'quantity_delta' => $line->delta_quantity,
                'reserved_delta' => 0,
                'quantity_before' => $before,
                'quantity_after' => $next,
                'reserved_before' => $reserved,
                'reserved_after' => $reserved,
                'reason' => $line->motif ?? $adjustment->motif,
                'reference_type' => StockAdjustment::class,
                'reference_id' => $adjustment->id,
                'actor_id' => $adjustment->created_by,
                'meta' => array_filter([
                    'line_note' => $line->note,
                    'adjustment_type' => $adjustment->type,
                ]),
            ]);
        }

        $adjustment->update(['status' => 'appliqué', 'applied_at' => now()]);
    }
}
