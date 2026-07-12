<?php

namespace App\Http\Requests\Delivery;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'delivery_boy_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('role', 'delivery'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'delivery_boy_id.exists' => 'Cet utilisateur n\'a pas le rôle livreur.',
        ];
    }
}
