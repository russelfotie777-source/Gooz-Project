<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'support_email' => $this->support_email,
            'support_phone' => $this->support_phone,
            'country' => $this->country,
            'updated_at' => $this->updated_at,
        ];
    }
}
