<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliverySettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'base_fee' => $this->base_fee,
            'free_radius_km' => $this->free_radius_km,
            'price_per_km' => $this->price_per_km,
            'free_item_count' => $this->free_item_count,
            'price_per_extra_item' => $this->price_per_extra_item,
            'min_fee' => $this->min_fee,
            'max_fee' => $this->max_fee,
            'updated_at' => $this->updated_at,
        ];
    }
}
