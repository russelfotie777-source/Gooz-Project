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
  Schema::create('stocks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('cascade');
    $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
    $table->integer('quantity_available')->default(0);
    $table->integer('quantity_reserved')->default(0);
    $table->timestamps();
    
    $table->unique(['product_id', 'product_variant_id', 'warehouse_id'], 'unique_warehouse_stock');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
