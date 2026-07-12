<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
                Rule::unique('categories', 'slug')->ignore($this->route('category')),
            ],
            'parent_id' => [
                'nullable', 'integer', 'exists:categories,id',
                Rule::notIn([$this->route('category')?->id]),
            ],
            'image' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
