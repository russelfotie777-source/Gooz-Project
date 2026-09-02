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
        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('base_price', 15, 2)->nullable()->after('material');
            $table->decimal('promo_price', 15, 2)->nullable()->after('base_price');
            $table->boolean('is_promotion')->default(false)->after('promo_price');
        });

        // Preserve existing pricing: a variant's new absolute base_price becomes
        // the product's old base_price plus the variant's old delta, and it
        // inherits the product's promo if the product was on promotion.
        // MySQL UPDATE-JOIN syntax — not valid SQLite. Under the test suite
        // (SQLite, always a fresh empty database) there's no legacy pricing
        // data to migrate, so this whole block is a real-database-only step.
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement('
                UPDATE product_variants pv
                INNER JOIN products p ON p.id = pv.product_id
                SET
                    pv.base_price = COALESCE(p.base_price, 0) + COALESCE(pv.additional_price, 0),
                    pv.promo_price = CASE
                        WHEN p.is_promotion AND p.promo_price IS NOT NULL
                        THEN p.promo_price + COALESCE(pv.additional_price, 0)
                        ELSE NULL
                    END,
                    pv.is_promotion = p.is_promotion
            ');
        }

        DB::statement('UPDATE product_variants SET base_price = 0 WHERE base_price IS NULL');

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE product_variants MODIFY base_price DECIMAL(15, 2) NOT NULL DEFAULT 0');
        }

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('additional_price');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['base_price', 'promo_price', 'is_promotion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('base_price', 15, 2)->default(0)->after('description');
            $table->decimal('promo_price', 15, 2)->nullable()->after('base_price');
            $table->boolean('is_promotion')->default(false)->after('promo_price');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('additional_price', 15, 2)->default(0)->after('material');
        });

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement('
                UPDATE products p
                INNER JOIN (
                    SELECT product_id, MIN(base_price) AS min_price
                    FROM product_variants
                    GROUP BY product_id
                ) v ON v.product_id = p.id
                SET p.base_price = v.min_price
            ');
        }

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['base_price', 'promo_price', 'is_promotion']);
        });
    }
};
