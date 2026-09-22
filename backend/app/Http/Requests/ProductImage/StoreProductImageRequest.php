<?php

namespace App\Http\Requests\ProductImage;

use App\Services\ImageResizer;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required', ImageResizer::UPLOAD_MIMES_RULE, 'max:4096'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'is_primary' => ['boolean'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ];
    }
}
