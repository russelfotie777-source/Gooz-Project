<?php

namespace App\Http\Requests\StockAdjustment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStockAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Locked once applied: an applied adjustment's stock effects are
        // already committed, so it can no longer be edited (only re-read).
        return $this->route('stockAdjustment')?->status !== 'appliqué';
    }

    public function rules(): array
    {
        return [
            'warehouse_id' => ['sometimes', 'required', 'integer', Rule::exists('warehouses', 'id')],
            'type' => ['nullable', 'string', 'max:50'],
            'status' => ['sometimes', 'required', Rule::in(['brouillon', 'appliqué'])],
            'motif' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'lines' => ['sometimes', 'required', 'array', 'min:1'],
            'lines.*.product_id' => ['required_with:lines', 'integer', Rule::exists('products', 'id')],
            'lines.*.product_variant_id' => ['required_with:lines', 'integer', Rule::exists('product_variants', 'id')],
            'lines.*.delta_quantity' => ['required_with:lines', 'integer', 'not_in:0'],
            'lines.*.motif' => ['nullable', 'string', 'max:255'],
            'lines.*.note' => ['nullable', 'string'],
        ];
    }
}
