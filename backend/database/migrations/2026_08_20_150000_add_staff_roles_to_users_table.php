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
        // ENUM is MySQL-specific DDL — no-op under SQLite (test suite). See
        // 2026_07_12_141742_add_delivery_role_to_users_table.php's comment:
        // SQLite's role CHECK constraint stays at whatever value list was
        // last widened there, so a test creating a non-'customer'-role user
        // needs that fixed for real, not guarded around again here.
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('customer', 'admin', 'delivery', 'stagiaire', 'staff', 'manager', 'super_admin') NOT NULL DEFAULT 'customer'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE users SET role = 'admin' WHERE role IN ('stagiaire', 'staff', 'manager', 'super_admin')");

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('customer', 'admin', 'delivery') NOT NULL DEFAULT 'customer'");
        }
    }
};
