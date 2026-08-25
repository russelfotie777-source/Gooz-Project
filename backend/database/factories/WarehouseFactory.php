<?php

namespace Database\Factories;

use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Warehouse>
 */
class WarehouseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'region' => fake()->randomElement(['Littoral', 'Centre', 'Ouest']),
            'ville' => fake()->randomElement(['Douala', 'Yaoundé', 'Bafoussam']),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
