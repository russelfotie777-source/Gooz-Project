<?php

namespace App\Http\Requests\Review;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            // Only required for a guest (no Sanctum token) — a signed-in
            // shopper is already identified via their account. This route
            // sits outside auth:sanctum (reviews work without an account),
            // so the user — if any — has to be resolved explicitly here too.
            'guest_name' => [$this->user('sanctum') ? 'nullable' : 'required', 'string', 'max:255'],
        ];
    }
}
