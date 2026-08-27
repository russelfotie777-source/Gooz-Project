<?php

namespace Tests\Feature;

use App\Models\DeviceToken;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\User;
use App\Services\PushNotificationService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SendReviewRequestsTest extends TestCase
{
    private function deliveredOrder(User $user): Order
    {
        return Order::create([
            'user_id' => $user->id,
            'order_reference' => 'ORD-TEST-'.uniqid(),
            'status' => 'livrée',
            'total_amount' => 10000,
            'discount_amount' => 0,
            'delivery_fees' => 1500,
            'delivery_method' => 'livraison',
            'shipping_phone' => '670000000',
        ]);
    }

    // Bypasses Eloquent so the order/delivery's "delivered since" timestamp
    // can be backdated deterministically, same approach as CartReminderTest.
    private function backdate(string $table, int $id, int $daysAgo, string $column): void
    {
        DB::table($table)->where('id', $id)->update([$column => now()->subDays($daysAgo)]);
    }

    public function test_requests_a_review_three_days_after_a_delivery_and_marks_it_requested(): void
    {
        $user = User::factory()->create();
        DeviceToken::factory()->create(['user_id' => $user->id]);
        $order = $this->deliveredOrder($user);
        $delivery = Delivery::create([
            'order_id' => $order->id,
            'delivery_boy_id' => User::factory()->create(['role' => 'delivery'])->id,
            'delivery_status' => 'livré',
            'delivered_at' => now(),
        ]);
        $this->backdate('deliveries', $delivery->id, 4, 'delivered_at');

        $this->mock(PushNotificationService::class, function ($mock) use ($user) {
            $mock->shouldReceive('sendToUser')->once()->withArgs(fn ($notifiedUser) => $notifiedUser->is($user));
        });

        $this->artisan('notifications:review-requests')->assertSuccessful();

        $this->assertNotNull($order->fresh()->review_requested_at);
        $this->assertDatabaseHas('user_notifications', ['user_id' => $user->id, 'type' => 'review_request']);
    }

    public function test_does_not_request_a_review_before_the_delay_has_elapsed(): void
    {
        $user = User::factory()->create();
        DeviceToken::factory()->create(['user_id' => $user->id]);
        $order = $this->deliveredOrder($user);
        Delivery::create([
            'order_id' => $order->id,
            'delivery_boy_id' => User::factory()->create(['role' => 'delivery'])->id,
            'delivery_status' => 'livré',
            'delivered_at' => now()->subDay(),
        ]);

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldNotReceive('sendToUser'));

        $this->artisan('notifications:review-requests')->assertSuccessful();

        $this->assertNull($order->fresh()->review_requested_at);
    }

    public function test_falls_back_to_the_order_updated_at_for_pickup_orders_with_no_delivery_row(): void
    {
        $user = User::factory()->create();
        DeviceToken::factory()->create(['user_id' => $user->id]);
        $order = $this->deliveredOrder($user);
        $this->backdate('orders', $order->id, 4, 'updated_at');

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldReceive('sendToUser')->once());

        $this->artisan('notifications:review-requests')->assertSuccessful();

        $this->assertNotNull($order->fresh()->review_requested_at);
    }

    public function test_does_not_request_a_review_twice_for_the_same_order(): void
    {
        $user = User::factory()->create();
        DeviceToken::factory()->create(['user_id' => $user->id]);
        $order = $this->deliveredOrder($user);
        $order->update(['review_requested_at' => now()]);
        $this->backdate('orders', $order->id, 10, 'updated_at');

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldNotReceive('sendToUser'));

        $this->artisan('notifications:review-requests')->assertSuccessful();
    }

    public function test_skips_a_user_with_no_registered_device_without_marking_the_order_as_requested(): void
    {
        $user = User::factory()->create();
        $order = $this->deliveredOrder($user);
        $this->backdate('orders', $order->id, 10, 'updated_at');

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldNotReceive('sendToUser'));

        $this->artisan('notifications:review-requests')->assertSuccessful();

        $this->assertNull($order->fresh()->review_requested_at);
    }
}
