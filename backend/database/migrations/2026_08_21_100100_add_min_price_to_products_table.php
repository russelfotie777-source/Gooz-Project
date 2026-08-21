<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Denormalized so ProductController's price sort (and
        // HomepageSectionController's price_range strategy) can ORDER BY an
        // indexed column instead of a correlated subquery on
        // product_variants for every row — see the performance audit.
        // Kept in sync by ProductVariantObserver on every variant
        // create/update/delete; matches the old subquery's scope exactly
        // (MIN(base_price) across ALL variants, active or not — the
        // subquery never filtered on is_active either).
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('min_price', 15, 2)->nullable()->after('category_id');
        });

        DB::statement(<<<'SQL'
            UPDATE products
            SET min_price = (
                SELECT MIN(base_price) FROM product_variants WHERE product_variants.product_id = products.id
            )
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('min_price');
        });
    }
};
