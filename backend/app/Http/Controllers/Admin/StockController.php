<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockResource;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Read-only: stock quantities are consulted here, not edited. Adjustments
 * happen through the separate "Ajustement de stock" flow.
 */
class StockController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $stocks = Stock::query()
            ->with(['product:id,name', 'variant:id,product_id,name,size,color,material,barcode', 'warehouse:id,name'])
            ->when($request->query('q'), fn ($q, $search) => $q->where(function ($query) use ($search) {
                $query->whereHas('product', fn ($p) => $p->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('variant', fn ($v) => $v->where('barcode', 'like', "%{$search}%"));
            }))
            ->latest()
            ->paginate($perPage);

        return StockResource::collection($stocks);
    }

    public function show(Stock $stock): StockResource
    {
        return new StockResource($stock->load(['product', 'variant', 'warehouse']));
    }
}
