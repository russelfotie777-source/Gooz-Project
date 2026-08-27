<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\DeviceToken;
use App\Models\Product;
use App\Models\User;
use App\Services\PushNotificationService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CartReminderTest extends TestCase
{
    private function cartWithItem(User $user, bool $active = true): Cart
    {
        $cart = Cart::create(['user_id' => $user->id, 'is_active' => $active]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => Product::factory()->create()->id,
            'quantity' => 1,
        ]);

        return $cart->fresh();
    }

    // Bypasses Eloquent's auto-managed timestamps entirely — the only
    // reliable way to backdate "how long has this cart been idle" for a test.
    private function backdate(Cart $cart, int $hoursAgo, string $column = 'updated_at'): void
    {
        DB::table('carts')->where('id', $cart->id)->update([$column => now()->subHours($hoursAgo)]);
    }

    public function test_sends_the_first_reminder_once_a_cart_has_been_idle_past_the_first_stage(): void
    {
        $user = User::factory()->create();
        DeviceToken::factory()->create(['user_id' => $user->id]);
        $cart = $this->cartWithItem($user);
        $this->backdate($cart, 5); // stage 1 fires after 4h idle

        $this->mock(PushNotificationService::class, function ($mock) {
            $mock->shouldReceive('sendToUser')->once();
        });

        $this->artisan('notifications:cart-reminders')->assertSuccessful();

        $cart->refresh();
        $this->assertSame(1, $cart->reminder_count);
        $this->assertNotNull($cart->last_reminder_at);
        $this->assertDatabaseHas('user_notifications', ['user_id' => $user->id, 'type' => 'cart_reminder']);
    }

    public function test_does_not_remind_a_cart_that_has_not_been_idle_long_enough(): void
    {
        $user = User::factory()->create();
        DeviceToken::factory()->create(['user_id' => $user->id]);
        $cart = $this->cartWithItem($user);
        $this->backdate($cart, 1); // under the 4h stage-1 threshold

        $this->mock(PushNotificationService::class, function ($mock) {
            $mock->shouldNotReceive('sendToUser');
        });

        $this->artisan('notifications:cart-reminders')->assertSuccessful();

        $this->assertSame(0, $cart->fresh()->reminder_count);
    }

    public function test_sends_the_second_reminder_a_day_after_the_first(): void
    {
        $user = User::factory()->create();
        DeviceToken::factory()->create(['user_id' => $user->id]);
        $cart = $this->cartWithItem($user);
        $cart->update(['reminder_count' => 1]);
        $this->backdate($cart, 25, 'last_reminder_at'); // stage 2 fires 24h after stage 1

        $this->mock(PushNotificationService::class, function ($mock) {
            $mock->shouldReceive('sendToUser')->once();
        });

        $this->artisan('notifications:cart-reminders')->assertSuccessful();

        $this->assertSame(2, $cart->fresh()->reminder_count);
    }

    public function test_a_cart_that_already_had_both_reminders_is_left_alone(): void
    {
        $user = User::factory()->create();
        DeviceToken::factory()->create(['user_id' => $user->id]);
        $cart = $this->cartWithItem($user);
        $cart->update(['reminder_count' => 2]);
        $this->backdate($cart, 1000, 'last_reminder_at');

        $this->mock(PushNotificationService::class, function ($mock) {
            $mock->shouldNotReceive('sendToUser');
        });

        $this->artisan('notifications:cart-reminders')->assertSuccessful();

        $this->assertSame(2, $cart->fresh()->reminder_count);
    }

    public function test_skips_a_user_with_no_registered_device(): void
    {
        $user = User::factory()->create();
        $cart = $this->cartWithItem($user);
        $this->backdate($cart, 10);

        $this->mock(PushNotificationService::class, function ($mock) {
            $mock->shouldNotReceive('sendToUser');
        });

        $this->artisan('notifications:cart-reminders')->assertSuccessful();

        $this->assertSame(0, $cart->fresh()->reminder_count);
        $this->assertDatabaseMissing('user_notifications', ['user_id' => $user->id]);
    }

    public function test_ignores_an_inactive_already_checked_out_cart(): void
    {
        $user = User::factory()->create();
        DeviceToken::factory()->create(['user_id' => $user->id]);
        $cart = $this->cartWithItem($user, active: false);
        $this->backdate($cart, 10);

        $this->mock(PushNotificationService::class, function ($mock) {
            $mock->shouldNotReceive('sendToUser');
        });

        $this->artisan('notifications:cart-reminders')->assertSuccessful();

        $this->assertSame(0, $cart->fresh()->reminder_count);
    }

    public function test_ignores_an_empty_cart(): void
    {
        $user = User::factory()->create();
        DeviceToken::factory()->create(['user_id' => $user->id]);
        $cart = Cart::create(['user_id' => $user->id, 'is_active' => true]);
        $this->backdate($cart, 10);

        $this->mock(PushNotificationService::class, function ($mock) {
            $mock->shouldNotReceive('sendToUser');
        });

        $this->artisan('notifications:cart-reminders')->assertSuccessful();

        $this->assertSame(0, $cart->fresh()->reminder_count);
    }
}
