<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
            ]),
            'variant' => $this->whenLoaded('variant', fn () => $this->variant ? [
                'id' => $this->variant->id,
                'display_name' => $this->variant->name
                    ?: collect([$this->variant->size, $this->variant->color, $this->variant->material])->filter()->join(' · ') ?: null,
                'barcode' => $this->variant->barcode,
            ] : null),
            'warehouse' => $this->whenLoaded('warehouse', fn () => [
                'id' => $this->warehouse->id,
                'name' => $this->warehouse->name,
            ]),
            'quantity_available' => $this->quantity_available,
            'quantity_reserved' => $this->quantity_reserved,
            'quantity_free' => $this->quantity_available - $this->quantity_reserved,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
