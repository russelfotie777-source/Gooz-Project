<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomepageAdSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'flash_sacrifice_product' => $this->flashSacrificeProduct ? new ProductResource($this->flashSacrificeProduct) : null,
            'mystery_box_product' => $this->mysteryBoxProduct ? new ProductResource($this->mysteryBoxProduct) : null,
        ];
    }
}
