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
        DB::statement("ALTER TABLE users MODIFY role ENUM('customer', 'admin', 'delivery', 'stagiaire', 'staff', 'manager', 'super_admin') NOT NULL DEFAULT 'customer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE users SET role = 'admin' WHERE role IN ('stagiaire', 'staff', 'manager', 'super_admin')");
        DB::statement("ALTER TABLE users MODIFY role ENUM('customer', 'admin', 'delivery') NOT NULL DEFAULT 'customer'");
    }
};
