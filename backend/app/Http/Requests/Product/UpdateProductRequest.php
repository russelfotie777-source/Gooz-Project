<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('products', 'slug')->ignore($this->route('product')),
            ],
            'description' => ['nullable', 'string'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'specifications' => ['nullable', 'array'],
            'specifications.*.label' => ['required_with:specifications', 'string', 'max:255'],
            'specifications.*.value' => ['required_with:specifications', 'string', 'max:255'],
            'product_details' => ['nullable', 'string'],
            'more_info' => ['nullable', 'string'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'category_ids' => ['sometimes', 'required', 'array', 'min:1'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'reference' => [
                'nullable', 'string', 'max:255',
                Rule::unique('products', 'reference')->ignore($this->route('product')),
            ],
            'is_active' => ['boolean'],
        ];
    }
}
