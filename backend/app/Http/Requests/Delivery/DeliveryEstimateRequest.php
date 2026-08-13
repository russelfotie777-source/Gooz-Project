<?php

namespace App\Http\Requests\Delivery;

use Illuminate\Foundation\Http\FormRequest;

class DeliveryEstimateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'neighborhood_id' => ['required', 'integer', 'exists:neighborhoods,id'],
            'item_count' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
