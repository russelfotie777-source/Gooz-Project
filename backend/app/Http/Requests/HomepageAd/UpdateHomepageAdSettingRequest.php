<?php

namespace App\Http\Requests\HomepageAd;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHomepageAdSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'flash_sacrifice_product_id' => ['nullable', 'integer', 'exists:products,id'],
            'mystery_box_product_id' => ['nullable', 'integer', 'exists:products,id'],
        ];
    }
}
