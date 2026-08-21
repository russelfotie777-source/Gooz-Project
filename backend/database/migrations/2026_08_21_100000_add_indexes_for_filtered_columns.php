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
        // is_active: filtered on virtually every public product query.
        // base_price: filtered/sorted by price range and by ProductController's
        // price sort — see the performance audit's DB findings.
        Schema::table('products', function (Blueprint $table) {
            $table->index('is_active');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->index('base_price');
        });

        // Scanned in full by HomepageSectionController's best_sellers window
        // filter and by the (not yet built) admin order-date filters.
        Schema::table('orders', function (Blueprint $table) {
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropIndex(['base_price']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};
