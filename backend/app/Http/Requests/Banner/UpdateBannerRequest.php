<?php

namespace App\Http\Requests\Banner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'min:3', 'max:100'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'link_type' => ['sometimes', 'required', Rule::in(['external', 'product'])],
            'link_url' => [Rule::requiredIf($this->link_type === 'external'), 'nullable', 'url', 'max:2048'],
            'product_id' => [Rule::requiredIf($this->link_type === 'product'), 'nullable', 'integer', 'exists:products,id'],
            'location' => ['sometimes', 'required', Rule::in(['homepage', 'category', 'search', 'checkout'])],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['boolean'],
        ];
    }
}
