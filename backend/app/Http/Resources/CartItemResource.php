<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $unitPrice = $this->product->is_promotion && $this->product->promo_price
            ? $this->product->promo_price
            : $this->product->base_price;
        $unitPrice += $this->variant?->additional_price ?? 0;

        return [
            'id' => $this->id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'variant' => new ProductVariantResource($this->whenLoaded('variant')),
            'quantity' => $this->quantity,
            'unit_price' => $unitPrice,
            'line_total' => round($unitPrice * $this->quantity, 2),
        ];
    }
}
