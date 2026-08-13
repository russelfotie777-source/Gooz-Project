<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Pricing lives entirely on the variant now; an item added without one
        // has nothing to charge.
        $unitPrice = $this->variant?->effectivePrice() ?? 0;

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
