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
        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('internal_name');
            $table->string('display_title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            $table->enum('section_type', ['automatic', 'manual', 'mixed'])->default('automatic');
            $table->enum('display_layout', ['horizontal_list', 'grid'])->default('horizontal_list');
            $table->enum('automatic_strategy', [
                'new_arrivals',
                'best_sellers',
                'category_showcase',
                'brand_list',
                'category_list',
                'price_range',
            ])->nullable();
            $table->enum('display_mode', ['variants', 'products'])->default('products');
            $table->enum('sort_direction', ['asc', 'desc'])->default('asc');

            $table->unsignedInteger('item_limit')->default(8);
            $table->enum('visibility', ['everyone', 'logged_in', 'guests'])->default('everyone');
            $table->string('view_all_url')->nullable();

            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('show_title')->default(true);
            $table->boolean('show_view_all')->default(true);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('position')->default(0);

            $table->unsignedInteger('window_days')->nullable();
            $table->json('category_ids')->nullable();
            $table->json('brand_ids')->nullable();
            $table->decimal('min_price', 12, 2)->nullable();
            $table->decimal('max_price', 12, 2)->nullable();
            $table->boolean('in_stock_only')->default(false);
            $table->boolean('campaign_products_only')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homepage_sections');
    }
};
