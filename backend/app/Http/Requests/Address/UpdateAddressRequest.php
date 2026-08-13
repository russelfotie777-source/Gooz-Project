<?php

namespace App\Http\Requests\Address;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['nullable', 'string', 'max:255'],
            'recipient_name' => ['sometimes', 'required', 'string', 'max:255'],
            'recipient_phone' => ['sometimes', 'required', 'string', 'regex:/^\+?[0-9]{8,15}$/'],
            'country' => ['nullable', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'ville' => ['sometimes', 'required', 'string', 'max:255'],
            'quartier' => ['nullable', 'string', 'max:255'],
            'address_line' => ['nullable', 'string', 'max:500'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'is_default' => ['boolean'],
        ];
    }
}
