<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockAdjustment\StoreStockAdjustmentRequest;
use App\Http\Requests\StockAdjustment\UpdateStockAdjustmentRequest;
use App\Http\Resources\StockAdjustmentResource;
use App\Models\InventoryLedger;
use App\Models\Stock;
use App\Models\StockAdjustment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
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

    public function update(UpdateStockAdjustmentRequest $request, StockAdjustment $stockAdjustment): StockAdjustmentResource
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $stockAdjustment) {
            $stockAdjustment->update(collect($data)->except(['lines', 'status'])->all());

            if (array_key_exists('lines', $data)) {
                $stockAdjustment->lines()->delete();
                $stockAdjustment->lines()->createMany($data['lines']);
            }

            $wantsApply = ($data['status'] ?? $stockAdjustment->status) === 'appliqué';

            if ($wantsApply && $stockAdjustment->status !== 'appliqué') {
                $this->apply($stockAdjustment->fresh('lines'));
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
