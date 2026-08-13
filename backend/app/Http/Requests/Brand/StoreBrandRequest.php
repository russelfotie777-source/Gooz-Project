<?php

namespace App\Http\Requests\Brand;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreBrandRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', 'unique:brands,name'],
            'slug' => ['required', 'string', 'max:255', 'unique:brands,slug'],
            'logo' => ['nullable', 'image', 'max:4096'],
            'description' => ['nullable', 'string'],
            'country_origin' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
