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
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->decimal('base_price', 15, 2);
    $table->decimal('promo_price', 15, 2)->nullable();
    $table->foreignId('brand_id')->nullable()->constrained()->onDelete('set null'); // Liaison propre vers brands
    $table->string('category');
    $table->string('sub_category')->nullable();
    $table->string('reference')->unique()->nullable();
    $table->boolean('is_active')->default(true);
    $table->boolean('is_promotion')->default(false);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
