<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\PushNotificationService;
use Tests\TestCase;

class PriceDropNotificationTest extends TestCase
{
    public function test_lowering_a_variants_price_notifies_shoppers_who_favorited_the_product(): void
    {
        $shopper = User::factory()->create();
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 10000]);
        $shopper->favorites()->create(['product_id' => $product->id, 'last_seen_price' => 10000]);

        $this->mock(PushNotificationService::class, function ($mock) use ($shopper) {
            $mock->shouldReceive('sendToUser')
                ->once()
                ->withArgs(fn ($user, $title) => $user->is($shopper) && $title === 'Baisse de prix !');
        });

        // Refetched, like a real request would (route model binding resolves
        // a fresh instance) — reusing the just-created $variant object would
        // leave wasRecentlyCreated stuck true and mask the update entirely.
        ProductVariant::find($variant->id)->update(['base_price' => 7000]);

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $shopper->id,
            'type' => 'price_drop',
        ]);
        $this->assertSame('7000.00', $shopper->favorites()->first()->last_seen_price);
    }

    public function test_activating_a_promotion_that_undercuts_the_base_price_counts_as_a_drop(): void
    {
        $shopper = User::factory()->create();
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 10000]);
        $shopper->favorites()->create(['product_id' => $product->id, 'last_seen_price' => 10000]);

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldReceive('sendToUser')->once());

        ProductVariant::find($variant->id)->update(['is_promotion' => true, 'promo_price' => 6000]);

        $this->assertDatabaseHas('user_notifications', ['user_id' => $shopper->id, 'type' => 'price_drop']);
    }

    public function test_raising_a_price_does_not_notify(): void
    {
        $shopper = User::factory()->create();
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 5000]);
        $shopper->favorites()->create(['product_id' => $product->id, 'last_seen_price' => 5000]);

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldNotReceive('sendToUser'));

        ProductVariant::find($variant->id)->update(['base_price' => 8000]);

        $this->assertDatabaseMissing('user_notifications', ['user_id' => $shopper->id, 'type' => 'price_drop']);
    }

    public function test_a_drop_on_a_variant_that_was_never_the_cheapest_does_not_notify(): void
    {
        $shopper = User::factory()->create();
        $product = Product::factory()->create();
        ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 3000]);
        $expensiveVariant = ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 10000]);
        $shopper->favorites()->create(['product_id' => $product->id, 'last_seen_price' => 3000]);

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldNotReceive('sendToUser'));

        // Still well above the other variant's 3000 price, so the product's
        // overall "starting from" price a shopper sees hasn't moved.
        ProductVariant::find($expensiveVariant->id)->update(['base_price' => 8000]);

        $this->assertDatabaseMissing('user_notifications', ['type' => 'price_drop']);
    }

    public function test_creating_a_new_variant_does_not_trigger_a_price_drop_notification(): void
    {
        $shopper = User::factory()->create();
        $product = Product::factory()->create();
        ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 5000]);
        $shopper->favorites()->create(['product_id' => $product->id, 'last_seen_price' => 5000]);

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldNotReceive('sendToUser'));

        ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 1000]);
    }

    public function test_a_product_with_no_favorites_is_not_notified_about(): void
    {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 5000]);

        $this->mock(PushNotificationService::class, fn ($mock) => $mock->shouldNotReceive('sendToUser'));

        ProductVariant::find($variant->id)->update(['base_price' => 2000]);

        $this->assertDatabaseCount('user_notifications', 0);
    }
}
