<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductImage\StoreProductImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageController extends Controller
{
    public function store(StoreProductImageRequest $request, Product $product): ProductImageResource
    {
        $path = $request->file('image')->store("products/{$product->id}", 'public');

        if ($request->boolean('is_primary')) {
            $product->images()->update(['is_primary' => false]);
        }

        $image = $product->images()->create([
            'product_variant_id' => $request->validated('product_variant_id'),
            'image_url' => Storage::disk('public')->url($path),
            'is_primary' => $request->boolean('is_primary'),
        ]);

        return new ProductImageResource($image);
    }

    public function destroy(ProductImage $image)
    {
        $path = Str::after($image->image_url, '/storage/');
        Storage::disk('public')->delete($path);

        $image->delete();

        return response()->json(null, 204);
    }
}
