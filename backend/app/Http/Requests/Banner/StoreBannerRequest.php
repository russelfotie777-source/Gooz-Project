<?php

namespace App\Http\Requests\Banner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:100'],
            'description' => ['nullable', 'string'],
            'image' => ['required', 'image', 'max:2048'],
            'link_type' => ['required', Rule::in(['external', 'product'])],
            'link_url' => [Rule::requiredIf($this->link_type === 'external'), 'nullable', 'url', 'max:2048'],
            'product_id' => [Rule::requiredIf($this->link_type === 'product'), 'nullable', 'integer', 'exists:products,id'],
            'location' => ['required', Rule::in(['homepage', 'homepage_ad_1', 'homepage_ad_2', 'category', 'search', 'checkout'])],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'is_active' => ['boolean'],
        ];
    }
}
