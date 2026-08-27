<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class FavoriteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'product_id' => Product::inRandomOrder()->value('id') ?? Product::factory(),
            'last_seen_price' => $this->faker->randomFloat(2, 500, 50000),
        ];
    }
}
