<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Services\PushNotificationService;
use Tests\TestCase;

class AdminOrderTest extends TestCase
{
    private function order(User $user): Order
    {
        return Order::create([
            'user_id' => $user->id,
            'order_reference' => 'ORD-TEST-'.uniqid(),
            'status' => 'en_attente',
            'total_amount' => 10000,
            'discount_amount' => 0,
            'delivery_fees' => 0,
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000000',
        ]);
    }

    public function test_updating_order_status_notifies_the_shopper_in_app_and_via_push(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $order = $this->order($user);

        $this->mock(PushNotificationService::class, function ($mock) use ($user) {
            $mock->shouldReceive('sendToUser')
                ->once()
                ->withArgs(fn ($notifiedUser) => $notifiedUser->is($user));
        });

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'en_préparation'])
            ->assertOk();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $user->id,
            'type' => 'order_status',
        ]);
        // The message should read naturally ("en préparation"), not dump
        // the raw enum value with its underscore.
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $user->id,
            'body' => 'Le statut de votre commande est désormais : en préparation.',
        ]);
    }

    public function test_a_non_admin_without_the_permission_cannot_update_order_status(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = $this->order(User::factory()->create());

        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'annulée'])
            ->assertForbidden();
    }
}
