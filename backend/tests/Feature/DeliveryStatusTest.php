<?php

namespace Tests\Feature;

use App\Models\Delivery;
use App\Models\Order;
use App\Models\User;
use App\Services\PushNotificationService;
use Tests\TestCase;

class DeliveryStatusTest extends TestCase
{
    private function deliveryForNewOrder(): Delivery
    {
        $user = User::factory()->create();
        $order = Order::create([
            'user_id' => $user->id,
            'order_reference' => 'ORD-TEST-'.uniqid(),
            'status' => 'confirmée',
            'total_amount' => 10000,
            'discount_amount' => 0,
            'delivery_fees' => 1500,
            'delivery_method' => 'livraison',
            'shipping_phone' => '670000000',
        ]);

        return Delivery::create([
            'order_id' => $order->id,
            'delivery_boy_id' => User::factory()->create(['role' => 'delivery'])->id,
            'delivery_status' => 'en_attente',
        ]);
    }

    public function test_marking_a_delivery_en_route_uses_the_dedicated_wording_and_notifies(): void
    {
        $delivery = $this->deliveryForNewOrder();
        $shopper = $delivery->order->user;

        $this->mock(PushNotificationService::class, function ($mock) use ($shopper) {
            $mock->shouldReceive('sendToUser')
                ->once()
                ->withArgs(fn ($user, $title) => $user->is($shopper) && str_starts_with($title, 'Livreur en route'));
        });

        $this->actingAs($delivery->deliveryBoy, 'sanctum')
            ->patchJson("/api/v1/deliveries/{$delivery->id}/status", ['delivery_status' => 'en_transit'])
            ->assertOk();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $shopper->id,
            'type' => 'delivery_status',
            'body' => 'Votre livreur est en route pour vous livrer votre commande.',
        ]);
    }

    public function test_marking_a_delivery_delivered_also_confirms_the_order_as_livree(): void
    {
        $delivery = $this->deliveryForNewOrder();

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldReceive('sendToUser')->once());

        $this->actingAs($delivery->deliveryBoy, 'sanctum')
            ->patchJson("/api/v1/deliveries/{$delivery->id}/status", ['delivery_status' => 'livré'])
            ->assertOk();

        $this->assertSame('livrée', $delivery->order->fresh()->status);
        $this->assertNotNull($delivery->fresh()->delivered_at);
    }

    public function test_a_delivery_person_cannot_update_someone_elses_delivery(): void
    {
        $delivery = $this->deliveryForNewOrder();
        $otherDeliveryPerson = User::factory()->create(['role' => 'delivery']);

        $this->actingAs($otherDeliveryPerson, 'sanctum')
            ->patchJson("/api/v1/deliveries/{$delivery->id}/status", ['delivery_status' => 'en_transit'])
            ->assertForbidden();
    }
}
