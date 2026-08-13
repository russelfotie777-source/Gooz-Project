<?php

namespace App\Http\Requests\Brand;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('brands', 'name')->ignore($this->route('brand')),
            ],
            'slug' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('brands', 'slug')->ignore($this->route('brand')),
            ],
            'logo' => ['nullable', 'image', 'max:4096'],
            'description' => ['nullable', 'string'],
            'country_origin' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
