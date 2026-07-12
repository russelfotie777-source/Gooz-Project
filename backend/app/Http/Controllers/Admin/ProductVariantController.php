<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductVariant\StoreProductVariantRequest;
use App\Http\Requests\ProductVariant\UpdateProductVariantRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;

class ProductVariantController extends Controller
{
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
