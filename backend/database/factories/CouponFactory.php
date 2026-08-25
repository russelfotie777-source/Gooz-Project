<?php

namespace Database\Factories;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('PROMO##??')),
            'type' => 'percentage',
            'value' => 10,
        ];
    }

    public function fixed(float $value): static
    {
        return $this->state(fn () => ['type' => 'fixed', 'value' => $value]);
    }

    public function percentage(float $value): static
    {
        return $this->state(fn () => ['type' => 'percentage', 'value' => $value]);
    }

    public function expired(): static
    {
        return $this->state(fn () => ['expires_at' => now()->subDay()]);
    }

    public function maxUses(int $max, int $used = 0): static
    {
        return $this->state(fn () => ['max_uses' => $max, 'used_count' => $used]);
    }

    public function minOrderAmount(float $amount): static
    {
        return $this->state(fn () => ['min_order_amount' => $amount]);
    }
}
