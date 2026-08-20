<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderLineResource extends JsonResource
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
            ] : null),
            'quantity_ordered' => $this->quantity_ordered,
            'quantity_invoiced' => $this->quantity_invoiced,
            'quantity_billable' => $this->quantity_ordered - $this->quantity_invoiced,
            'unit_price' => $this->unit_price,
        ];
    }
}
