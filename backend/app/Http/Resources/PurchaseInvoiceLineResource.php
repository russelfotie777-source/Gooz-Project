<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseInvoiceLineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_order_line' => $this->whenLoaded('purchaseOrderLine', fn () => [
                'id' => $this->purchaseOrderLine->id,
                'product' => $this->purchaseOrderLine->relationLoaded('product') ? [
                    'id' => $this->purchaseOrderLine->product->id,
                    'name' => $this->purchaseOrderLine->product->name,
                ] : null,
                'variant' => $this->purchaseOrderLine->relationLoaded('variant') && $this->purchaseOrderLine->variant ? [
                    'id' => $this->purchaseOrderLine->variant->id,
                    'display_name' => $this->purchaseOrderLine->variant->name
                        ?: collect([$this->purchaseOrderLine->variant->size, $this->purchaseOrderLine->variant->color, $this->purchaseOrderLine->variant->material])->filter()->join(' · ') ?: null,
                ] : null,
            ]),
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'line_total' => $this->line_total,
        ];
    }
}
