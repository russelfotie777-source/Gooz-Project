<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = CartItemResource::collection($this->whenLoaded('items'));

        return [
            'id' => $this->id,
            'items' => $items,
            'total' => $this->relationLoaded('items')
                ? round($this->items->sum(function ($item) {
                    $unitPrice = $item->product->is_promotion && $item->product->promo_price
                        ? $item->product->promo_price
                        : $item->product->base_price;
                    $unitPrice += $item->variant?->additional_price ?? 0;

                    return $unitPrice * $item->quantity;
                }), 2)
                : null,
        ];
    }
}
