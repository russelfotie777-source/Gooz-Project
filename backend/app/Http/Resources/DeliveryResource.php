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
            'delivery_boy' => new UserResource($this->whenLoaded('deliveryBoy')),
            'delivery_status' => $this->delivery_status,
            'tracking_code' => $this->tracking_code,
        ];
    }
}
