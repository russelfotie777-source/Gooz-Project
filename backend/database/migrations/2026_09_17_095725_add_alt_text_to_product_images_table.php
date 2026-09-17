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
        Schema::table('product_images', function (Blueprint $table) {
            // Per-image, not per-product: each photo shows a different
            // angle/detail, so a single shared alt text wouldn't describe
            // most of them. Falls back to the product name on the frontend
            // when empty (see ProductCard.tsx / ProductDetail.tsx).
            $table->string('alt_text')->nullable()->after('is_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropColumn('alt_text');
        });
    }
};
