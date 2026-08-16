<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\InventoryLedgerResource;
use App\Models\InventoryLedger;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Read-only audit trail of every stock movement (adjustments, orders...).
 * Nothing writes here directly — entries are created by the controllers
 * that actually mutate the `stocks` table.
 */
class InventoryLedgerController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $entries = InventoryLedger::query()
            ->with(['warehouse:id,name', 'product:id,name', 'variant:id,product_id,name,size,color,material', 'actor:id,name', 'reference'])
            ->when($request->query('warehouse_id'), fn ($q, $id) => $q->where('warehouse_id', $id))
            ->when($request->query('movement_type'), fn ($q, $type) => $q->where('movement_type', $type))
            ->when($request->query('q'), fn ($q, $search) => $q->whereHas(
                'product',
                fn ($query) => $query->where('name', 'like', "%{$search}%")
            ))
            ->latest()
            ->paginate($perPage);

        return InventoryLedgerResource::collection($entries);
    }

    public function show(InventoryLedger $inventoryLedger): InventoryLedgerResource
    {
        return new InventoryLedgerResource(
            $inventoryLedger->load(['warehouse', 'product', 'variant', 'actor', 'reference'])
        );
    }
}
