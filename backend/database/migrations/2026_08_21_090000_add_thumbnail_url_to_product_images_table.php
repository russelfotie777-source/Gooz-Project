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
        // Grid/card views (ProductCard) only ever need a small image —
        // serving the same full-size upload used for the detail gallery
        // there was the single biggest page-weight offender found in the
        // performance audit. Nullable: existing rows only have image_url
        // until re-uploaded (no backfill — test data, not worth the churn).
        Schema::table('product_images', function (Blueprint $table) {
            $table->string('thumbnail_url')->nullable()->after('image_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropColumn('thumbnail_url');
        });
    }
};
