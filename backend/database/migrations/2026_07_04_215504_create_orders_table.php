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
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('order_reference')->unique();
    $table->enum('status', ['en_attente', 'confirmée', 'en_préparation', 'expédiée', 'livrée', 'annulée'])->default('en_attente');
    $table->decimal('total_amount', 15, 2);
    $table->decimal('delivery_fees', 10, 2)->default(0);
    $table->text('shipping_address');
    $table->string('shipping_phone');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
