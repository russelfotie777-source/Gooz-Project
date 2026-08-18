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
        Schema::create('inventory_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->onDelete('restrict');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('restrict');
            $table->string('movement_type');
            $table->integer('quantity_delta');
            $table->integer('reserved_delta')->default(0);
            $table->integer('quantity_before');
            $table->integer('quantity_after');
            $table->integer('reserved_before')->default(0);
            $table->integer('reserved_after')->default(0);
            $table->string('reason')->nullable();
            $table->nullableMorphs('reference');
            $table->foreignId('actor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_ledgers');
    }
};
