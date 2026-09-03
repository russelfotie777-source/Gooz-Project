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
        // ENUM is MySQL-specific DDL — no-op under SQLite (test suite),
        // which already gets the widened value list directly from
        // 2026_08_18_010000_add_targeting_fields_to_banners_table.php (a
        // fresh test database replays every migration from scratch). This
        // one only needs to widen real, already-migrated MySQL databases
        // (local dev + production) in place. Same pattern as
        // 2026_08_20_150000_add_staff_roles_to_users_table.php.
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE banners MODIFY location ENUM('homepage', 'homepage_ad_1', 'homepage_ad_2', 'category', 'search', 'checkout') NOT NULL DEFAULT 'homepage'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE banners SET location = 'homepage' WHERE location IN ('homepage_ad_1', 'homepage_ad_2')");

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE banners MODIFY location ENUM('homepage', 'category', 'search', 'checkout') NOT NULL DEFAULT 'homepage'");
        }
    }
};
