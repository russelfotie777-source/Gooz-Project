<?php

namespace App\Http\Requests\Auth;

use App\Services\ImageResizer;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'avatar' => ['required', ImageResizer::uploadRule(), 'max:4096'],
        ];
    }
}
