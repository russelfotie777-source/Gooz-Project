<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'customer_name' => $this->whenLoaded('user', fn () => $this->user->name),
            'customer_phone' => $this->whenLoaded('user', fn () => $this->user->phone),
            'label' => $this->label,
            'recipient_name' => $this->recipient_name,
            'recipient_phone' => $this->recipient_phone,
            'country' => $this->country,
            'region' => $this->region,
            'ville' => $this->ville,
            'quartier' => $this->quartier,
            'address_line' => $this->address_line,
            'postal_code' => $this->postal_code,
            'is_default' => $this->is_default,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
