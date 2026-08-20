<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RolePermission\UpdateRolePermissionsRequest;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RolePermissionController extends Controller
{
    public function index(Request $request): array
    {
        return [
            'roles' => RolePermission::CONFIGURABLE_ROLES,
            'permissions' => RolePermission::ALL,
            'granted' => RolePermission::query()
                ->whereIn('role', RolePermission::CONFIGURABLE_ROLES)
                ->get(['role', 'permission'])
                ->groupBy('role')
                ->map(fn ($rows) => $rows->pluck('permission')->values()),
        ];
    }

    public function update(UpdateRolePermissionsRequest $request): array
    {
        $role = $request->validated('role');
        $permissions = $request->validated('permissions');

        DB::transaction(function () use ($role, $permissions) {
            RolePermission::where('role', $role)->delete();

            foreach ($permissions as $permission) {
                RolePermission::create(['role' => $role, 'permission' => $permission]);
            }
        });

        return [
            'role' => $role,
            'permissions' => $permissions,
        ];
    }
}
