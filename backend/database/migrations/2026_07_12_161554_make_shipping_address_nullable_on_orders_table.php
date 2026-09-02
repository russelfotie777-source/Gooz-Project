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
        // shipping_address doesn't apply to "retrait" (pickup) orders, so it
        // can no longer be a required column. NOT NULL is a real constraint
        // SQLite enforces too — ->change() works natively on both without
        // doctrine/dbal on this Laravel version (a MySQL-only raw ALTER
        // MODIFY here would leave the column still NOT NULL under the test
        // suite's SQLite database, an actual schema gap, not a harmless
        // skip).
        Schema::table('orders', function (Blueprint $table) {
            $table->text('shipping_address')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->text('shipping_address')->nullable(false)->change();
        });
    }
};
