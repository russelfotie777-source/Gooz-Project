<?php

namespace App\Http\Requests\CashSession;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCashSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'opening_cash' => ['required', 'numeric', 'min:0'],
            'accounting_period_id' => ['required', 'integer', Rule::exists('accounting_periods', 'id')],
        ];
    }
}
