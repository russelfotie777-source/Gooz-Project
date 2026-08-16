<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockAdjustmentLineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
            ]),
            'variant' => $this->whenLoaded('variant', fn () => [
                'id' => $this->variant->id,
                'display_name' => $this->variant->name
                    ?: collect([$this->variant->size, $this->variant->color, $this->variant->material])->filter()->join(' · ') ?: null,
                'barcode' => $this->variant->barcode,
            ]),
            'delta_quantity' => $this->delta_quantity,
            'motif' => $this->motif,
            'note' => $this->note,
        ];
    }
}
