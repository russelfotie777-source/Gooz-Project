<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->whenLoaded('product', fn () => $this->product->name),
            'name' => $this->name,
            'display_name' => $this->name ?: collect([$this->size, $this->color, $this->material])
                ->filter()
                ->join(' · ') ?: null,
            'size' => $this->size,
            'color' => $this->color,
            'material' => $this->material,
            'base_price' => $this->base_price,
            'promo_price' => $this->promo_price,
            'is_promotion' => $this->is_promotion,
            'price' => $this->is_promotion && $this->promo_price ? $this->promo_price : $this->base_price,
            'cost_price' => $this->cost_price,
            'tax_rate' => $this->tax_rate,
            'barcode' => $this->barcode,
            'is_active' => $this->is_active,
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'images_count' => $this->whenCounted('images'),
            'stock_quantity' => $this->whenLoaded(
                'stocks',
                fn () => $this->stocks->sum(fn ($stock) => $stock->quantity_available - $stock->quantity_reserved)
            ),
        ];
    }
}
