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
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('delivery_method', ['livraison', 'retrait'])->default('livraison')->after('user_id');
            $table->foreignId('warehouse_id')->nullable()->after('delivery_method')->constrained()->onDelete('set null');
            $table->decimal('shipping_latitude', 10, 7)->nullable()->after('shipping_phone');
            $table->decimal('shipping_longitude', 10, 7)->nullable()->after('shipping_latitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('warehouse_id');
            $table->dropColumn(['delivery_method', 'shipping_latitude', 'shipping_longitude']);
        });
    }
};
