<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\User;
use Tests\TestCase;

class CouponTest extends TestCase
{
    public function test_a_valid_percentage_coupon_returns_the_correct_discount(): void
    {
        $user = User::factory()->create();
        Coupon::factory()->percentage(10)->create(['code' => 'PROMO10']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/coupons/validate', [
            'code' => 'PROMO10',
            'subtotal' => 10000,
        ]);

        $response->assertOk()->assertJsonPath('discount_amount', 1000);
    }

    public function test_a_valid_fixed_coupon_returns_the_correct_discount(): void
    {
        $user = User::factory()->create();
        Coupon::factory()->fixed(1500)->create(['code' => 'MINUS1500']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/coupons/validate', [
            'code' => 'MINUS1500',
            'subtotal' => 10000,
        ]);

        $response->assertOk()->assertJsonPath('discount_amount', 1500);
    }

    public function test_a_fixed_discount_never_exceeds_the_subtotal(): void
    {
        $user = User::factory()->create();
        Coupon::factory()->fixed(5000)->create(['code' => 'BIGDISCOUNT']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/coupons/validate', [
            'code' => 'BIGDISCOUNT',
            'subtotal' => 2000,
        ]);

        $response->assertOk()->assertJsonPath('discount_amount', 2000);
    }

    public function test_code_lookup_is_case_insensitive(): void
    {
        $user = User::factory()->create();
        Coupon::factory()->percentage(10)->create(['code' => 'PROMO10']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/coupons/validate', [
            'code' => 'promo10',
            'subtotal' => 10000,
        ]);

        $response->assertOk();
    }

    public function test_an_unknown_code_is_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/coupons/validate', [
            'code' => 'DOESNOTEXIST',
            'subtotal' => 10000,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('code');
    }

    public function test_an_expired_coupon_is_rejected(): void
    {
        $user = User::factory()->create();
        Coupon::factory()->expired()->create(['code' => 'EXPIRED']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/coupons/validate', [
            'code' => 'EXPIRED',
            'subtotal' => 10000,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('code');
    }

    public function test_a_coupon_past_its_max_uses_is_rejected(): void
    {
        $user = User::factory()->create();
        Coupon::factory()->maxUses(5, used: 5)->create(['code' => 'EXHAUSTED']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/coupons/validate', [
            'code' => 'EXHAUSTED',
            'subtotal' => 10000,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('code');
    }

    public function test_a_coupon_below_its_minimum_order_amount_is_rejected(): void
    {
        $user = User::factory()->create();
        Coupon::factory()->minOrderAmount(20000)->create(['code' => 'BIGORDERSONLY']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/coupons/validate', [
            'code' => 'BIGORDERSONLY',
            'subtotal' => 5000,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('code');
    }

    public function test_an_inactive_coupon_is_rejected(): void
    {
        $user = User::factory()->create();
        Coupon::factory()->create(['code' => 'DISABLED', 'is_active' => false]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/coupons/validate', [
            'code' => 'DISABLED',
            'subtotal' => 10000,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('code');
    }
}
