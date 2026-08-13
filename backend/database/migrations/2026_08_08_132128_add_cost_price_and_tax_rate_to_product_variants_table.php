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
        Schema::table('product_variants', function (Blueprint $table) {
            // For a future accounting/margin module: cost price and the VAT
            // rate applicable to this variant. Both optional — most variants
            // won't need them until that module exists.
            $table->decimal('cost_price', 15, 2)->nullable()->after('promo_price');
            $table->decimal('tax_rate', 5, 2)->nullable()->after('cost_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['cost_price', 'tax_rate']);
        });
    }
};
