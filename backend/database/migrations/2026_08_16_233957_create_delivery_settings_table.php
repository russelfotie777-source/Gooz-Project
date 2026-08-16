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
        Schema::create('delivery_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('base_fee', 10, 2);
            $table->decimal('free_radius_km', 6, 2);
            $table->decimal('price_per_km', 10, 2);
            $table->unsignedInteger('free_item_count');
            $table->decimal('price_per_extra_item', 10, 2);
            $table->decimal('min_fee', 10, 2);
            $table->decimal('max_fee', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_settings');
    }
};
