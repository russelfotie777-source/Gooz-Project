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
            // Reuses an existing row when one's available rather than always
            // minting a fresh fake brand/category — creating 10 throwaway
            // products (e.g. via tinker, outside a RefreshDatabase-wrapped
            // test) used to also leave 10 garbage "DuBuque, Lubowitz and
            // Bosco"-style brands/categories behind in whatever database it
            // ran against. Only falls back to Factory() when the table is
            // genuinely empty (a fresh test database's very first call).
            'brand_id' => Brand::inRandomOrder()->value('id') ?? Brand::factory(),
            'category_id' => Category::inRandomOrder()->value('id') ?? Category::factory(),
            'reference' => strtoupper(fake()->unique()->bothify('REF-####??')),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
