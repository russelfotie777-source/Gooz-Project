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
            'product_id' => ['sometimes', 'required', 'integer', 'exists:products,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:100'],
            'material' => ['nullable', 'string', 'max:100'],
            'base_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'promo_price' => ['nullable', 'numeric', 'min:0', 'lt:base_price'],
            'is_promotion' => ['boolean'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'barcode' => [
                'nullable', 'string', 'max:255',
                Rule::unique('product_variants', 'barcode')->ignore($this->route('variant')),
            ],
            'is_active' => ['boolean'],
        ];
    }
}
