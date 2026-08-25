<?php

namespace Database\Factories;

use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'text' => fake()->sentence(6),
            'icon' => null,
            'link_url' => null,
            'position' => fake()->unique()->numberBetween(1, 1000),
            'starts_at' => null,
            'ends_at' => null,
            'is_active' => true,
        ];
    }
}
