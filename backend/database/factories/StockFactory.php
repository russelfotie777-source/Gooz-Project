<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Stock>
 */
class StockFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'product_variant_id' => null,
            'warehouse_id' => Warehouse::factory(),
            'quantity_available' => fake()->numberBetween(5, 50),
            'quantity_reserved' => 0,
        ];
    }
}
