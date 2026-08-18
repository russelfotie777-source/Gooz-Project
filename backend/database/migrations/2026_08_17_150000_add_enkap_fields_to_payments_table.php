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
            // transaction_reference already stores Enkap's orderTransactionId
            // (txid); order_reference on the orders table doubles as our
            // merchantReference — no new column needed for either.
            $table->string('checkout_url')->nullable()->after('transaction_reference');
            $table->string('provider_status')->nullable()->after('checkout_url');
            $table->json('provider_response')->nullable()->after('provider_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['checkout_url', 'provider_status', 'provider_response']);
        });
    }
};
