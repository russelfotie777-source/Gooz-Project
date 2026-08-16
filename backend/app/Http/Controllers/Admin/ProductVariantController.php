<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductVariant\StoreProductVariantRequest;
use App\Http\Requests\ProductVariant\UpdateProductVariantRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
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

        return new ProductVariantResource($variant->fresh());
    }

    public function update(UpdateProductVariantRequest $request, ProductVariant $variant): ProductVariantResource
    {
        $variant->update($request->validated());

        return new ProductVariantResource($variant->fresh());
    }

    public function destroy(ProductVariant $variant)
    {
        $variant->delete();

        return response()->json(null, 204);
    }
}
