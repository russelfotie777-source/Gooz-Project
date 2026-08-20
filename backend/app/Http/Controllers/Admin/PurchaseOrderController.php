<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseOrder\StorePurchaseOrderRequest;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $orders = PurchaseOrder::query()
            ->with('supplier:id,company_name')
            ->withCount('lines')
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);

        return PurchaseOrderResource::collection($orders);
    }

    public function show(PurchaseOrder $purchaseOrder): PurchaseOrderResource
    {
        return new PurchaseOrderResource(
            $purchaseOrder->load(['supplier', 'lines.product', 'lines.variant'])
        );
    }

    public function store(StorePurchaseOrderRequest $request): PurchaseOrderResource
    {
        $data = $request->validated();

        $order = DB::transaction(function () use ($data, $request) {
            $order = PurchaseOrder::create([
                'code' => 'BC-'.str_pad((string) (PurchaseOrder::max('id') + 1), 5, '0', STR_PAD_LEFT),
                'supplier_id' => $data['supplier_id'],
                'currency' => $data['currency'] ?? 'XAF',
                'status' => 'ouverte',
                'notes' => $data['notes'] ?? null,
                'created_by' => $request->user()?->id,
            ]);

            $order->lines()->createMany($data['lines']);

            return $order;
        });

        return new PurchaseOrderResource($order->load(['supplier', 'lines.product', 'lines.variant']));
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->lines()->where('quantity_invoiced', '>', 0)->exists()) {
            throw ValidationException::withMessages([
                'purchase_order' => "Cette commande d'achat a des lignes déjà facturées et ne peut pas être supprimée.",
            ]);
        }

        $purchaseOrder->delete();

        return response()->json(null, 204);
    }
}
