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
        Schema::table('payments', function (Blueprint $table) {
            // The reference actually sent to Enkap as "merchantReference".
            // Equal to orders.order_reference on the first attempt, but
            // Enkap rejects a second /api/order call reusing the same value
            // (confirmed live: "OBJECT_ALREADY_EXISTS") — a retry after a
            // failed payment needs a distinct one, tracked here so the
            // webhook (which Enkap calls back with whichever value we sent)
            // can still resolve to the right order. See
            // EnkapPaymentService::createOrder().
            $table->string('merchant_reference')->nullable()->unique()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('merchant_reference');
        });
    }
};
