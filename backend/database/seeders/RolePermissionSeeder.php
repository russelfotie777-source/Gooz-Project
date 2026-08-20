<?php

namespace Database\Seeders;

use App\Models\RolePermission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * manager/staff get every permission by default so introducing this
     * table doesn't silently strip access they already had under the old
     * all-or-nothing isAdmin() check. stagiaire starts with none, matching
     * what you'd expect for an intern account — an admin grants access from
     * there via the Roles & Permissions screen.
     */
    public function run(): void
    {
        foreach (['manager', 'staff'] as $role) {
            foreach (RolePermission::ALL as $permission) {
                RolePermission::firstOrCreate(['role' => $role, 'permission' => $permission]);
            }
        }
    }
}
