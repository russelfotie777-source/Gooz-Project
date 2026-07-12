<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_reference' => $this->order_reference,
            'status' => $this->status,
            'total_amount' => $this->total_amount,
            'discount_amount' => $this->discount_amount,
            'coupon_code' => $this->whenLoaded('coupon', fn () => $this->coupon?->code),
            'delivery_fees' => $this->delivery_fees,
            'delivery_method' => $this->delivery_method,
            'shipping_address' => $this->shipping_address,
            'shipping_phone' => $this->shipping_phone,
            'shipping_latitude' => $this->shipping_latitude,
            'shipping_longitude' => $this->shipping_longitude,
            'warehouse' => new WarehouseResource($this->whenLoaded('warehouse')),
            'user' => new UserResource($this->whenLoaded('user')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'delivery' => new DeliveryResource($this->whenLoaded('delivery')),
            'created_at' => $this->created_at,
        ];
    }
}
