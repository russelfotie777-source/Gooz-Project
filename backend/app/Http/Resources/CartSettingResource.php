<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'expires_after' => $this->expires_after,
            'expires_unit' => $this->expires_unit,
            'updated_at' => $this->updated_at,
        ];
    }
}
