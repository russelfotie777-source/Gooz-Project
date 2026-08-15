<?php

namespace App\Http\Requests\Supplier;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['sometimes', 'required', 'string', 'max:255'],
            'contact_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('suppliers', 'email')->ignore($this->route('supplier'))],
            'phone' => ['sometimes', 'required', 'string', 'max:20'],
            'pays' => ['nullable', 'string', 'max:100'],
            'numero_fiscal' => ['nullable', 'string', 'max:100'],
            'adresse' => ['sometimes', 'required', 'string'],
            'notes' => ['nullable', 'string'],
            'type' => ['sometimes', 'required', Rule::in(['local', 'international'])],
            'is_active' => ['boolean'],
        ];
    }
}
