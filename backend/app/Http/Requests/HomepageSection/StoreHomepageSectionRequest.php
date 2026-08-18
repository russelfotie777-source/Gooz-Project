<?php

namespace App\Http\Requests\HomepageSection;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreHomepageSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->slug ?: $this->display_title) ?: null,
        ]);
    }

    public function rules(): array
    {
        return [
            'internal_name' => ['required', 'string', 'max:255'],
            'display_title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:homepage_sections,slug'],
            'description' => ['nullable', 'string'],

            'section_type' => ['required', Rule::in(['automatic', 'manual', 'mixed'])],
            'display_layout' => ['required', Rule::in(['horizontal_list', 'grid'])],
            'automatic_strategy' => [
                Rule::requiredIf(in_array($this->section_type, ['automatic', 'mixed'], true)),
                'nullable',
                Rule::in(['new_arrivals', 'best_sellers', 'category_showcase', 'brand_list', 'category_list', 'price_range']),
            ],
            'display_mode' => ['required', Rule::in(['variants', 'products'])],
            'sort_direction' => ['required', Rule::in(['asc', 'desc'])],

            'item_limit' => ['required', 'integer', 'min:1', 'max:100'],
            'visibility' => ['required', Rule::in(['everyone', 'logged_in', 'guests'])],
            'view_all_url' => ['nullable', 'string', 'max:255'],

            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'show_title' => ['boolean'],
            'show_view_all' => ['boolean'],
            'is_active' => ['boolean'],

            'window_days' => ['nullable', 'integer', 'min:1'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'brand_ids' => ['nullable', 'array'],
            'brand_ids.*' => ['integer', 'exists:brands,id'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'gte:min_price'],
            'in_stock_only' => ['boolean'],
            'campaign_products_only' => ['boolean'],

            'items' => ['nullable', 'array'],
            'items.*.product_id' => ['required_with:items', 'integer', 'exists:products,id'],
        ];
    }
}
