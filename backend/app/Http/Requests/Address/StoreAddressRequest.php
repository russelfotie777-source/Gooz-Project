<?php

namespace App\Http\Requests\Address;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['nullable', 'string', 'max:255'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'recipient_phone' => ['required', 'string', 'regex:/^\+?[0-9]{8,15}$/'],
            'country' => ['nullable', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'ville' => ['required', 'string', 'max:255'],
            'quartier' => ['nullable', 'string', 'max:255'],
            'address_line' => ['nullable', 'string', 'max:500'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'is_default' => ['boolean'],
        ];
    }
}
