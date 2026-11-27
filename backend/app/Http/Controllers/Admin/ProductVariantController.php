<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductVariant\StoreProductVariantRequest;
use App\Http\Requests\ProductVariant\UpdateProductVariantRequest;
use App\Http\Resources\ProductVariantResource;
use App\Jobs\RevalidateFrontendCache;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductVariantController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $variants = ProductVariant::query()
            ->with('product:id,name')
            ->withCount('images')
            ->when($request->query('q'), fn ($q, $search) => $q->whereHas(
                'product',
                fn ($query) => $query->where('name', 'like', "%{$search}%")
            ))
            ->when($request->query('product_id'), fn ($q, $productId) => $q->where('product_id', $productId))
            ->latest()
            ->paginate($perPage);

        return ProductVariantResource::collection($variants);
    }

    public function show(ProductVariant $variant): ProductVariantResource
    {
        return new ProductVariantResource($variant->load(['product:id,name', 'images']));
    }

    public function store(StoreProductVariantRequest $request, Product $product): ProductVariantResource
    {
        $variant = $product->variants()->create($request->validated());

        RevalidateFrontendCache::dispatch(['products']);

        return new ProductVariantResource($variant->fresh());
    }

    public function update(UpdateProductVariantRequest $request, ProductVariant $variant): ProductVariantResource
    {
        $variant->update($request->validated());

        RevalidateFrontendCache::dispatch(['products']);

        return new ProductVariantResource($variant->fresh());
    }

    public function destroy(ProductVariant $variant)
    {
        try {
            $variant->delete();

            RevalidateFrontendCache::dispatch(['products']);
        } catch (QueryException $e) {
            // SQLSTATE 23000 here is the inventory_ledgers/stock_adjustment_lines
            // RESTRICT foreign key — any variant with real stock history (virtually
            // every variant actually sold/received) can't be hard-deleted by design.
            // The "Désactiver" toggle (is_active) is the intended way to retire it.
            if ($e->getCode() === '23000') {
                return response()->json([
                    'message' => 'Cette variante a un historique de stock (ventes, réceptions, ajustements) et ne peut pas être supprimée. Désactivez-la à la place pour la retirer du catalogue.',
                ], 409);
            }

            throw $e;
        }

        return response()->json(null, 204);
    }
}
