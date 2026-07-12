<?php

namespace App\Http\Requests\ProductVariant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'size' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:100'],
            'material' => ['nullable', 'string', 'max:100'],
            'additional_price' => ['nullable', 'numeric', 'min:0'],
            'barcode' => [
                'nullable', 'string', 'max:255',
                Rule::unique('product_variants', 'barcode')->ignore($this->route('variant')),
            ],
            'is_active' => ['boolean'],
        ];
    }
}
