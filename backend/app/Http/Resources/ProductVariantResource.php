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
            'size' => $this->size,
            'color' => $this->color,
            'material' => $this->material,
            'additional_price' => $this->additional_price,
            'barcode' => $this->barcode,
            'is_active' => $this->is_active,
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'stock_quantity' => $this->whenLoaded(
                'stocks',
                fn () => $this->stocks->sum(fn ($stock) => $stock->quantity_available - $stock->quantity_reserved)
            ),
        ];
    }
}
