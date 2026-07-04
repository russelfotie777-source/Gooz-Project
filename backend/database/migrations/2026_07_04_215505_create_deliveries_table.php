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
 Schema::create('deliveries', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->onDelete('cascade');
    $table->foreignId('delivery_boy_id')->nullable()->constrained('users')->onDelete('set null'); // Clé liée aux utilisateurs ayant le rôle livreur
    $table->enum('delivery_status', ['en_attente', 'pris_en_charge', 'en_transit', 'livré', 'échec'])->default('en_attente');
    $table->string('tracking_code')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
