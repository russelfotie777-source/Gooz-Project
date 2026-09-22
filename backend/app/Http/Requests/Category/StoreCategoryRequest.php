<?php

namespace App\Http\Requests\Category;

use App\Services\ImageResizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->name && ! $this->slug) {
            $this->merge(['slug' => Str::slug($this->name)]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug'],
            'image' => ['nullable', ImageResizer::UPLOAD_MIMES_RULE, 'max:4096'],
            'is_active' => ['boolean'],
        ];
    }
}
