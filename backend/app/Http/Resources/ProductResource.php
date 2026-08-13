<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price_from' => $this->whenLoaded('variants', function () {
                $prices = $this->variants->map(
                    fn ($variant) => $variant->is_promotion && $variant->promo_price
                        ? $variant->promo_price
                        : $variant->base_price
                );

                return $prices->isEmpty() ? null : $prices->min();
            }),
            'reference' => $this->reference,
            'is_active' => $this->is_active,
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'stock_quantity' => $this->whenLoaded(
                'stocks',
                fn () => $this->stocks->sum(fn ($stock) => $stock->quantity_available - $stock->quantity_reserved)
            ),
            'created_at' => $this->created_at,
        ];
    }
}
