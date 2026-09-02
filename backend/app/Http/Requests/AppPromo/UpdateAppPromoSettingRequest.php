<?php

namespace App\Http\Requests\AppPromo;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppPromoSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
        ];
    }
}
