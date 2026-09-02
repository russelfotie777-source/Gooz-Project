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
        // ENUM is MySQL-specific DDL — no-op under SQLite (test suite).
        // SQLite does enforce role's original ('customer','admin') value
        // list via a CHECK constraint (Laravel's enum() emits one there
        // too), which this leaves un-widened — fine as long as no test
        // creates a user with role other than the 'customer' default; if a
        // future test needs 'delivery'/'stagiaire'/etc, this needs a real
        // SQLite-side fix (e.g. rebuilding the CHECK constraint), not just
        // another guard.
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('customer', 'admin', 'delivery') NOT NULL DEFAULT 'customer'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer'");
        }
    }
};
