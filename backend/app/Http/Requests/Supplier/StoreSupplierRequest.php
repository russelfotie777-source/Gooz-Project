<?php

namespace App\Http\Requests\Supplier;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:suppliers,email'],
            'phone' => ['required', 'string', 'max:20'],
            'pays' => ['nullable', 'string', 'max:100'],
            'numero_fiscal' => ['nullable', 'string', 'max:100'],
            'adresse' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'type' => ['required', Rule::in(['local', 'international'])],
            'is_active' => ['boolean'],
        ];
    }
}
