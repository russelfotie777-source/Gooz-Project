<?php

namespace App\Http\Requests\CartSetting;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCartSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expires_after' => ['required', 'integer', 'min:1'],
            'expires_unit' => ['required', Rule::in(['heures', 'jours'])],
        ];
    }
}
