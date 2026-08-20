<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payee' => ['required', 'string', 'max:255'],
            'expense_account_id' => ['required', 'integer', Rule::exists('accounts', 'id')],
            'paid_from_account_id' => ['required', 'integer', Rule::exists('accounts', 'id')],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
