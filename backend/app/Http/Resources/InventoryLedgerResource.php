<?php

namespace App\Http\Resources;

use App\Models\Order;
use App\Models\StockAdjustment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class InventoryLedgerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'warehouse' => $this->whenLoaded('warehouse', fn () => [
                'id' => $this->warehouse->id,
                'name' => $this->warehouse->name,
            ]),
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
            ]),
            'variant' => $this->whenLoaded('variant', fn () => $this->variant ? [
                'id' => $this->variant->id,
                'display_name' => $this->variant->name
                    ?: collect([$this->variant->size, $this->variant->color, $this->variant->material])->filter()->join(' · ') ?: null,
            ] : null),
            'movement_type' => $this->movement_type,
            'reference' => $this->reference_type ? $this->referenceLabel() : null,
            'reason' => $this->reason,
            'quantity_delta' => $this->quantity_delta,
            'reserved_delta' => $this->reserved_delta,
            'quantity_before' => $this->quantity_before,
            'quantity_after' => $this->quantity_after,
            'reserved_before' => $this->reserved_before,
            'reserved_after' => $this->reserved_after,
            'actor' => $this->whenLoaded('actor', fn () => $this->actor ? [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
            ] : null),
            'meta' => collect($this->meta ?? [])
                ->map(fn ($value, $key) => ['key' => Str::headline($key), 'value' => $value])
                ->values(),
            'created_at' => $this->created_at,
        ];
    }

    private function referenceLabel(): ?string
    {
        $reference = $this->reference;

        if ($reference instanceof StockAdjustment) {
            return "Ajustement de stock #{$reference->id} — {$reference->type}";
        }

        if ($reference instanceof Order) {
            return "Commande {$reference->order_reference}";
        }

        return class_basename($this->reference_type)." #{$this->reference_id}";
    }
}
