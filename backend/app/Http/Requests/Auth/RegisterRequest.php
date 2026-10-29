<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9]{8,15}$/', 'unique:users,phone'],
            'password' => ['required', 'confirmed', Password::defaults()],
            // Optional — lets a phone+password account recover access via
            // "mot de passe oublié" (see AuthController::forgotPassword).
            // Without one, that account has no recovery path at all.
            'recovery_email' => ['nullable', 'email', 'max:255', 'unique:users,recovery_email'],
        ];
    }
}
