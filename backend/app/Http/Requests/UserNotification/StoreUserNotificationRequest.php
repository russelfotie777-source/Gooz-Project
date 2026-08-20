<?php

namespace App\Http\Requests\UserNotification;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'body' => ['nullable', 'string', 'max:2000'],
            'type' => ['nullable', 'string', 'max:50'],
            'send_to_all' => ['boolean'],
            'user_id' => [Rule::requiredIf(! $this->boolean('send_to_all')), 'nullable', 'integer', 'exists:users,id'],
            'send_push' => ['boolean'],
        ];
    }
}
