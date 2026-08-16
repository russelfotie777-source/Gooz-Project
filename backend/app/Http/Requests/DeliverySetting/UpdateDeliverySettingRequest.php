<?php

namespace App\Http\Requests\DeliverySetting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeliverySettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'base_fee' => ['required', 'numeric', 'min:0'],
            'free_radius_km' => ['required', 'numeric', 'min:0'],
            'price_per_km' => ['required', 'numeric', 'min:0'],
            'free_item_count' => ['required', 'integer', 'min:0'],
            'price_per_extra_item' => ['required', 'numeric', 'min:0'],
            'min_fee' => ['required', 'numeric', 'min:0', 'lte:max_fee'],
            'max_fee' => ['required', 'numeric', 'min:0', 'gte:min_fee'],
        ];
    }
}
