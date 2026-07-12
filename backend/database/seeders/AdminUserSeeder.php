<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['phone' => '699000001'],
            ['name' => 'Admin Gooz', 'password' => Hash::make('Password123!')]
        );

        // 'role' is deliberately not mass-assignable (see User::$fillable),
        // so it's set directly here, same as the admin-only API endpoint does.
        $admin->forceFill(['role' => 'admin'])->save();
    }
}
