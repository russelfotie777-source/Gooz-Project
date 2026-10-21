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
        Schema::table('reviews', function (Blueprint $table) {
            // ReviewController::store() already rejects a second review from
            // the same user with a "check, then insert" — not safe against
            // two near-simultaneous submissions (both pass the check before
            // either insert lands). This is the real guard: MySQL treats
            // each NULL user_id (guest reviews) as distinct, so guest
            // reviews are unaffected — only a signed-in user is limited to
            // one review per product.
            $table->unique(['user_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'product_id']);
        });
    }
};
