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
Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->onDelete('cascade');
    $table->decimal('amount', 15, 2);
    $table->enum('payment_method', ['carte', 'mobile_money', 'paypal', 'espèces'])->default('mobile_money');
    $table->enum('payment_status', ['en_attente', 'payé', 'échoué', 'remboursé'])->default('en_attente');
    $table->string('transaction_reference')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
