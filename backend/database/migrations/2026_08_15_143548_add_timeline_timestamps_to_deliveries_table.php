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
        Schema::table('deliveries', function (Blueprint $table) {
            $table->timestamp('shipped_at')->nullable()->after('tracking_code');
            $table->timestamp('out_for_delivery_at')->nullable()->after('shipped_at');
            $table->timestamp('delivered_at')->nullable()->after('out_for_delivery_at');
            $table->timestamp('failed_at')->nullable()->after('delivered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumn(['shipped_at', 'out_for_delivery_at', 'delivered_at', 'failed_at']);
        });
    }
};
