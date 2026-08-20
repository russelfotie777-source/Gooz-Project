<?php

namespace App\Http\Requests\CashSession;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCashSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'closing_cash' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
