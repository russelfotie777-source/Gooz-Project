<?php

namespace App\Http\Controllers;

use App\Http\Resources\FavoriteResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FavoriteController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $favorites = $request->user()->favorites()
            ->with(['product.brand', 'product.category', 'product.images', 'product.variants'])
            ->whereHas('product', fn ($q) => $q->where('is_active', true))
            ->paginate(20);

        return FavoriteResource::collection($favorites);
    }

    public function store(Request $request, Product $product): FavoriteResource
    {
        $favorite = $request->user()->favorites()->firstOrCreate(
            ['product_id' => $product->id],
            ['last_seen_price' => $this->lowestPrice($product)]
        );

        return new FavoriteResource($favorite->load('product'));
    }

    public function destroy(Request $request, Product $product)
    {
        $request->user()->favorites()->where('product_id', $product->id)->delete();

        return response()->json(null, 204);
    }

    private function lowestPrice(Product $product): ?float
    {
        $prices = $product->variants()->get()->map(fn ($variant) => $variant->effectivePrice());

        return $prices->isEmpty() ? null : (float) $prices->min();
    }
}
