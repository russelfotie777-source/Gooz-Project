<?php

namespace App\Http\Requests\RolePermission;

use App\Models\RolePermission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRolePermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', Rule::in(RolePermission::CONFIGURABLE_ROLES)],
            'permissions' => ['present', 'array'],
            'permissions.*' => [Rule::in(RolePermission::ALL)],
        ];
    }
}
