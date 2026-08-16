<?php

namespace App\Http\Requests\StockAdjustment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStockAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'warehouse_id' => ['required', 'integer', Rule::exists('warehouses', 'id')],
            'type' => ['nullable', 'string', 'max:50'],
            'status' => ['required', Rule::in(['brouillon', 'appliqué'])],
            'motif' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.product_id' => ['required', 'integer', Rule::exists('products', 'id')],
            'lines.*.product_variant_id' => ['required', 'integer', Rule::exists('product_variants', 'id')],
            'lines.*.delta_quantity' => ['required', 'integer', 'not_in:0'],
            'lines.*.motif' => ['nullable', 'string', 'max:255'],
            'lines.*.note' => ['nullable', 'string'],
        ];
    }
}
