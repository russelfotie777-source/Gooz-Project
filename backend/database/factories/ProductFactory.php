<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        // Str::slug() alone isn't guaranteed unique across two similar-ish
        // fake names (same collision risk the real backfill migration
        // guarded against) — the random suffix keeps every factory-made
        // product's slug unique without a uniqueness retry loop.
        $name = fake()->words(3, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(6),
            'description' => fake()->sentence(),
            'brand_id' => Brand::factory(),
            'category_id' => Category::factory(),
            'reference' => strtoupper(fake()->unique()->bothify('REF-####??')),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
