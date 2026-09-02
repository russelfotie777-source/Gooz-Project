<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
            $table->enum('link_type', ['external', 'product'])->default('external')->after('link_url');
            $table->foreignId('product_id')->nullable()->after('link_type')->constrained()->nullOnDelete();
            // homepage_ad_1/homepage_ad_2: the two side ad slots next to the
            // main hero carousel (see HeroSection) — widened later (see
            // add_ad_slot_locations_to_banners_table), same as
            // 2026_07_12_141742_add_delivery_role_to_users_table.php did for
            // users.role. Included directly here (not just in that later
            // migration) so a fresh SQLite test database gets the full
            // CHECK constraint from the start — SQLite doesn't apply the
            // later MySQL-only ALTER TABLE.
            $table->enum('location', ['homepage', 'homepage_ad_1', 'homepage_ad_2', 'category', 'search', 'checkout'])->default('homepage')->after('product_id');
            $table->timestamp('starts_at')->nullable()->after('location');
            $table->timestamp('ends_at')->nullable()->after('starts_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_id');
            $table->dropColumn(['description', 'link_type', 'location', 'starts_at', 'ends_at']);
        });
    }
};
