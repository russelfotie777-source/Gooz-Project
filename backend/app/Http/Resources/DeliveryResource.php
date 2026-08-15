<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'order' => $this->whenLoaded('order', fn () => [
                'id' => $this->order->id,
                'order_reference' => $this->order->order_reference,
                'status' => $this->order->status,
                'total_amount' => $this->order->total_amount,
                'user' => $this->order->user ? [
                    'id' => $this->order->user->id,
                    'name' => $this->order->user->name,
                ] : null,
                'payment_status' => $this->order->payment?->payment_status,
            ]),
            'delivery_boy' => new UserResource($this->whenLoaded('deliveryBoy')),
            'delivery_status' => $this->delivery_status,
            'tracking_code' => $this->tracking_code,
            'created_at' => $this->created_at,
            'shipped_at' => $this->shipped_at,
            'out_for_delivery_at' => $this->out_for_delivery_at,
            'delivered_at' => $this->delivered_at,
            'failed_at' => $this->failed_at,
        ];
    }
}
