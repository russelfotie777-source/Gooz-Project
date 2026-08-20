<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseInvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'purchase_order' => $this->whenLoaded('purchaseOrder', fn () => [
                'id' => $this->purchaseOrder->id,
                'code' => $this->purchaseOrder->code,
            ]),
            'supplier' => $this->whenLoaded('supplier', fn () => [
                'id' => $this->supplier->id,
                'company_name' => $this->supplier->company_name,
            ]),
            'currency' => $this->currency,
            'invoice_date' => $this->invoice_date,
            'due_date' => $this->due_date,
            'reference' => $this->reference,
            'attachment_url' => $this->attachment_path,
            'notes' => $this->notes,
            'status' => $this->status,
            'is_paid' => $this->is_paid,
            'total' => $this->total,
            'lines' => PurchaseInvoiceLineResource::collection($this->whenLoaded('lines')),
            'creator' => $this->whenLoaded('creator', fn () => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ] : null),
            'created_at' => $this->created_at,
        ];
    }
}
