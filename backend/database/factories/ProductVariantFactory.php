<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'color' => fake()->safeColorName(),
            'base_price' => fake()->numberBetween(1000, 200000),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    public function onPromotion(float $promoPrice): static
    {
        return $this->state(fn () => ['is_promotion' => true, 'promo_price' => $promoPrice]);
    }
}
