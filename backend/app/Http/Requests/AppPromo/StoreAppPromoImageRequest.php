<?php

namespace App\Http\Requests\AppPromo;

use App\Services\ImageResizer;
use Illuminate\Foundation\Http\FormRequest;

class StoreAppPromoImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required', ImageResizer::UPLOAD_MIMES_RULE, 'max:4096'],
            'is_active' => ['boolean'],
        ];
    }
}
