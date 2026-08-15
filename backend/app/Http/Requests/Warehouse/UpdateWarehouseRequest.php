<?php

namespace App\Http\Requests\Warehouse;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'type' => ['sometimes', 'required', Rule::in(['entrepot', 'boutique'])],
            'code' => ['nullable', 'string', 'max:50', Rule::unique('warehouses', 'code')->ignore($this->route('warehouse'))],
            'region' => ['sometimes', 'required', 'string', 'max:255'],
            'pays' => ['nullable', 'string', 'max:100'],
            'ville' => ['sometimes', 'required', 'string', 'max:255'],
            'quartier' => ['nullable', 'string', 'max:255'],
            'latitude' => ['sometimes', 'required', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'required', 'numeric', 'between:-180,180'],
            'phone' => ['nullable', 'string', 'max:20'],
            'responsible_name' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
