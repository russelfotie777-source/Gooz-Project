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
            'base_price' => $this->base_price,
            'promo_price' => $this->promo_price,
            'price' => $this->is_promotion && $this->promo_price
                ? $this->promo_price
                : $this->base_price,
            'reference' => $this->reference,
            'is_active' => $this->is_active,
            'is_promotion' => $this->is_promotion,
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
