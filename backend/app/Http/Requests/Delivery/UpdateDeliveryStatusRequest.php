<?php

namespace App\Http\Requests\Delivery;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDeliveryStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'delivery_status' => ['required', Rule::in([
                'en_attente', 'pris_en_charge', 'en_transit', 'livré', 'échec',
            ])],
        ];
    }
}
