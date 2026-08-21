<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductImage\StoreProductImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ImageResizer;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageController extends Controller
{
    // Grid cards and the detail gallery need very different sizes — storing
    // both up front avoids ever serving the 1200px version into a 400px
    // card slot (see the performance audit's #1 finding).
    private const THUMBNAIL_MAX_WIDTH = 400;

    private const DETAIL_MAX_WIDTH = 1200;

    public function store(StoreProductImageRequest $request, Product $product, ImageResizer $resizer): ProductImageResource
    {
        $dir = "products/{$product->id}";
        $file = $request->file('image');

        $detailPath = $resizer->resizeAndStore($file, $dir, self::DETAIL_MAX_WIDTH);
        $thumbnailPath = $resizer->resizeAndStore($file, $dir, self::THUMBNAIL_MAX_WIDTH);

        if ($request->boolean('is_primary')) {
            $product->images()->update(['is_primary' => false]);
        }

        $image = $product->images()->create([
            'product_variant_id' => $request->validated('product_variant_id'),
            'image_url' => Storage::disk('public')->url($detailPath),
            'thumbnail_url' => Storage::disk('public')->url($thumbnailPath),
            'is_primary' => $request->boolean('is_primary'),
        ]);

        return new ProductImageResource($image);
    }

    public function destroy(ProductImage $image)
    {
        Storage::disk('public')->delete(Str::after($image->image_url, '/storage/'));

        if ($image->thumbnail_url) {
            Storage::disk('public')->delete(Str::after($image->thumbnail_url, '/storage/'));
        }

        $image->delete();

        return response()->json(null, 204);
    }
}
