<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\User;
use App\Services\PushNotificationService;
use Tests\TestCase;

class AdminCouponBroadcastTest extends TestCase
{
    public function test_creating_an_active_coupon_broadcasts_it_to_every_active_customer(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $inactiveCustomer = User::factory()->create(['role' => 'customer', 'is_active' => false]);
        $staff = User::factory()->create(['role' => 'staff']);

        $this->mock(PushNotificationService::class, function ($mock) use ($customer) {
            $mock->shouldReceive('sendToUser')
                ->once()
                ->withArgs(fn ($user) => $user->is($customer));
        });

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/coupons', [
                'code' => 'PROMO10',
                'type' => 'percentage',
                'value' => 10,
                'is_active' => true,
            ])
            ->assertOk();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $customer->id,
            'type' => 'new_coupon',
        ]);
        $this->assertDatabaseMissing('user_notifications', ['user_id' => $inactiveCustomer->id]);
        $this->assertDatabaseMissing('user_notifications', ['user_id' => $staff->id]);
    }

    public function test_creating_an_inactive_coupon_does_not_broadcast(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldNotReceive('sendToUser'));

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/coupons', [
                'code' => 'PROMOOFF',
                'type' => 'fixed',
                'value' => 500,
                'is_active' => false,
            ])
            ->assertOk();

        $this->assertDatabaseCount('user_notifications', 0);
    }

    public function test_reactivating_a_coupon_broadcasts_but_editing_an_already_active_one_does_not(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $coupon = Coupon::create([
            'code' => 'REACT10',
            'type' => 'percentage',
            'value' => 15,
            'is_active' => false,
        ]);

        $this->mock(PushNotificationService::class, function ($mock) use ($customer) {
            $mock->shouldReceive('sendToUser')->once()->withArgs(fn ($user) => $user->is($customer));
        });

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/coupons/{$coupon->id}", [
                'type' => 'percentage',
                'value' => 15,
                'is_active' => true,
            ])
            ->assertOk();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $customer->id,
            'type' => 'new_coupon',
        ]);

        // Editing an already-active coupon (e.g. tweaking its value) must not
        // re-broadcast — only the false -> true transition should.
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/coupons/{$coupon->id}", [
                'type' => 'percentage',
                'value' => 20,
                'is_active' => true,
            ])
            ->assertOk();

        $this->assertDatabaseCount('user_notifications', 1);
    }
}
