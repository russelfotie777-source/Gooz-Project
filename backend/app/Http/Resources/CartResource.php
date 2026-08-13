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
                ? round($this->items->sum(
                    fn ($item) => ($item->variant?->effectivePrice() ?? 0) * $item->quantity
                ), 2)
                : null,
        ];
    }
}
