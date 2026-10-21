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
            // Lets CheckoutController::store() detect "this exact cart
            // already has an order whose payment hasn't resolved yet" and
            // return that order instead of creating a duplicate — the fix
            // for a double-submitted/retried checkout request. Nullable:
            // orders created before this migration have no cart to point to.
            $table->foreignId('cart_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cart_id');
        });
    }
};
