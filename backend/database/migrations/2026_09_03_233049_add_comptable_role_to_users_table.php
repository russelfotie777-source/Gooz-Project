<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ENUM is MySQL-specific DDL — no-op under SQLite (test suite), same
        // pattern as 2026_08_20_150000_add_staff_roles_to_users_table.php.
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('customer', 'admin', 'delivery', 'stagiaire', 'staff', 'manager', 'super_admin', 'comptable') NOT NULL DEFAULT 'customer'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE users SET role = 'staff' WHERE role = 'comptable'");

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('customer', 'admin', 'delivery', 'stagiaire', 'staff', 'manager', 'super_admin') NOT NULL DEFAULT 'customer'");
        }
    }
};
