<?php

namespace App\Http\Requests\Brand;

use Illuminate\Foundation\Http\FormRequest;

class StoreBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:brands,name'],
            'logo' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'country_origin' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
