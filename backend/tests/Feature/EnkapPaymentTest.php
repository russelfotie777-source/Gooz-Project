<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\PushNotificationService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class EnkapPaymentTest extends TestCase
{
    private const WEBHOOK_TOKEN = 'test-webhook-token';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.enkap.webhook_token' => self::WEBHOOK_TOKEN]);
    }

    private function webhookUrl(string $orderReference, ?string $token = self::WEBHOOK_TOKEN): string
    {
        return "/api/v1/webhooks/enkap/{$orderReference}".($token !== null ? '?token='.$token : '');
    }

    private function fakeEnkap(string $orderStatus = 'SUCCESS'): void
    {
        Http::fake([
            '*/token' => Http::response(['access_token' => 'fake-token'], 200),
            '*/api/order/status*' => Http::response(['status' => $orderStatus], 200),
            '*/api/order' => Http::response([
                'orderTransactionId' => 'TXN-123',
                'redirectUrl' => 'https://pay.enkap.example/redirect/TXN-123',
            ], 200),
        ]);
    }

    private function checkoutOrderViaMobileMoney(User $user): void
    {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 5000]);
        $warehouse = Warehouse::factory()->create();

        Stock::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'warehouse_id' => $warehouse->id,
            'quantity_available' => 10,
        ]);

        $cart = $user->carts()->create(['is_active' => true]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/checkout', [
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000020',
            'payment_method' => 'mobile_money',
            'warehouse_id' => $warehouse->id,
        ])->assertCreated();
    }

    public function test_checkout_with_mobile_money_initiates_an_enkap_order_with_the_right_payload(): void
    {
        $this->fakeEnkap();
        $user = User::factory()->create();

        $this->checkoutOrderViaMobileMoney($user);

        $order = Order::firstOrFail();

        Http::assertSent(function ($request) use ($order) {
            if (! str_ends_with(parse_url($request->url(), PHP_URL_PATH) ?? '', '/api/order')) {
                return false;
            }

            return $request['merchantReference'] === $order->order_reference
                && $request['currency'] === 'XAF'
                && (float) $request['totalAmount'] === (float) $order->total_amount
                && $request['phoneNumber'] === '670000020';
        });

        $this->assertDatabaseHas('payments', [
            'order_id' => $order->id,
            'transaction_reference' => 'TXN-123',
            'checkout_url' => 'https://pay.enkap.example/redirect/TXN-123',
        ]);
    }

    public function test_checkout_still_succeeds_even_if_enkap_initiation_fails(): void
    {
        Http::fake([
            '*/token' => Http::response(['access_token' => 'fake-token'], 200),
            '*/api/order' => Http::response(['error' => 'boom'], 500),
        ]);
        $user = User::factory()->create();

        // No exception/500 bubbling up to the customer — the order is
        // already committed by the time Enkap is contacted (see
        // CheckoutController::store's comment on this).
        $this->checkoutOrderViaMobileMoney($user);

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('payments', ['transaction_reference' => null]);
    }

    public function test_webhook_with_an_unknown_reference_is_a_no_op(): void
    {
        $this->fakeEnkap();

        $response = $this->putJson($this->webhookUrl('ORD-DOES-NOT-EXIST'));

        $response->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_webhook_without_the_correct_token_is_rejected(): void
    {
        $this->fakeEnkap();
        $user = User::factory()->create();
        $this->checkoutOrderViaMobileMoney($user);
        $order = Order::firstOrFail();

        $this->putJson($this->webhookUrl($order->order_reference, token: null))->assertForbidden();
        $this->putJson($this->webhookUrl($order->order_reference, token: 'wrong-token'))->assertForbidden();

        $order->refresh();
        $this->assertSame('en_attente', $order->status);
        Http::assertNotSent(fn ($request) => str_contains($request->url(), '/api/order/status'));
    }

    public function test_webhook_confirms_the_order_once_enkap_reports_success(): void
    {
        $this->fakeEnkap(orderStatus: 'SUCCESS');
        $user = User::factory()->create();
        $this->checkoutOrderViaMobileMoney($user);

        $order = Order::firstOrFail();
        $this->assertSame('en_attente', $order->status);

        $response = $this->putJson($this->webhookUrl($order->order_reference));

        $response->assertNoContent();
        $order->refresh();
        $this->assertSame('confirmée', $order->status);
        $this->assertSame('payé', $order->payment->payment_status);
        $this->assertSame('SUCCESS', $order->payment->provider_status);
    }

    public function test_webhook_does_not_confirm_the_order_while_enkap_still_reports_pending(): void
    {
        $this->fakeEnkap(orderStatus: 'IN_PROGRESS');
        $user = User::factory()->create();
        $this->checkoutOrderViaMobileMoney($user);

        $order = Order::firstOrFail();

        $this->putJson($this->webhookUrl($order->order_reference))->assertNoContent();

        $order->refresh();
        $this->assertSame('en_attente', $order->status);
        $this->assertSame('en_attente', $order->payment->payment_status);
    }

    public function test_webhook_notifies_the_shopper_when_the_payment_fails(): void
    {
        $this->fakeEnkap(orderStatus: 'FAILED');
        $user = User::factory()->create();
        $this->checkoutOrderViaMobileMoney($user);
        $order = Order::firstOrFail();

        $this->mock(PushNotificationService::class, function ($mock) use ($user) {
            $mock->shouldReceive('sendToUser')
                ->once()
                ->withArgs(fn ($notifiedUser) => $notifiedUser->is($user));
        });

        $this->putJson($this->webhookUrl($order->order_reference))->assertNoContent();

        $order->refresh();
        $this->assertSame('échoué', $order->payment->payment_status);
        $this->assertDatabaseHas('user_notifications', ['user_id' => $user->id, 'type' => 'payment_failed']);
    }

    public function test_a_repeated_failed_status_check_does_not_notify_twice(): void
    {
        $this->fakeEnkap(orderStatus: 'FAILED');
        $user = User::factory()->create();
        $this->checkoutOrderViaMobileMoney($user);
        $order = Order::firstOrFail();

        // Only the transition into "échoué" should notify — a webhook retry
        // or a manual admin recheck re-confirming the same failed status
        // must not spam the shopper a second time.
        $this->mock(PushNotificationService::class, function ($mock) {
            $mock->shouldReceive('sendToUser')->once();
        });

        $this->putJson($this->webhookUrl($order->order_reference))->assertNoContent();
        $this->putJson($this->webhookUrl($order->order_reference))->assertNoContent();

        $this->assertDatabaseCount('user_notifications', 1);
    }

    public function test_payment_refresh_is_forbidden_for_another_users_order(): void
    {
        $this->fakeEnkap();
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $this->checkoutOrderViaMobileMoney($owner);
        $order = Order::firstOrFail();

        $this->actingAs($intruder, 'sanctum')
            ->postJson("/api/v1/orders/{$order->order_reference}/payment/refresh")
            ->assertForbidden();
    }

    public function test_payment_refresh_rejects_a_non_mobile_money_order(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id]);
        $order = Order::create([
            'user_id' => $user->id,
            'order_reference' => 'ORD-TEST-CASH',
            'status' => 'en_attente',
            'total_amount' => 1000,
            'discount_amount' => 0,
            'delivery_fees' => 0,
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000021',
        ]);
        Payment::create(['order_id' => $order->id, 'amount' => 1000, 'payment_method' => 'espèces', 'payment_status' => 'en_attente']);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/orders/{$order->order_reference}/payment/refresh")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('payment');
    }

    public function test_payment_refresh_retries_enkap_initiation_when_no_transaction_reference_yet(): void
    {
        // First call (during checkout) fails, second (the manual retry
        // below) succeeds — a sequence, not two separate Http::fake() calls,
        // since a later fake() doesn't reliably take priority over an
        // earlier one registered for the same URL pattern.
        Http::fake(['*/token' => Http::response(['access_token' => 'fake-token'], 200)]);
        Http::fakeSequence('*/api/order')
            ->push(['error' => 'boom'], 500)
            ->push(['orderTransactionId' => 'TXN-RETRY', 'redirectUrl' => 'https://pay.enkap.example/retry'], 200);

        $user = User::factory()->create();
        $this->checkoutOrderViaMobileMoney($user);
        $order = Order::firstOrFail();
        $this->assertNull($order->payment->transaction_reference);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/orders/{$order->order_reference}/payment/refresh")
            ->assertOk();

        $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'transaction_reference' => 'TXN-RETRY']);
    }

    public function test_a_mobile_money_checkout_leaves_the_items_in_the_cart(): void
    {
        // Unlike a cash order, the purchase isn't final yet at this point —
        // the shopper still has to complete payment on Enkap's page, and
        // that can fail or be abandoned. The cart should still have their
        // items if that happens.
        $this->fakeEnkap();
        $user = User::factory()->create();

        $this->checkoutOrderViaMobileMoney($user);

        $cart = $user->carts()->where('is_active', true)->first();
        $this->assertNotNull($cart);
        $this->assertSame(1, $cart->items()->count());
    }

    public function test_confirming_the_payment_removes_only_the_purchased_items_from_the_cart(): void
    {
        $this->fakeEnkap(orderStatus: 'SUCCESS');
        $user = User::factory()->create();
        $this->checkoutOrderViaMobileMoney($user);
        $order = Order::firstOrFail();

        // Added to the same still-active cart *after* checkout — simulates
        // the shopper continuing to browse while their payment is pending.
        $cart = $user->carts()->where('is_active', true)->firstOrFail();
        $unrelatedProduct = Product::factory()->create();
        $unrelatedVariant = ProductVariant::factory()->create(['product_id' => $unrelatedProduct->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $unrelatedProduct->id,
            'product_variant_id' => $unrelatedVariant->id,
            'quantity' => 1,
        ]);

        $this->putJson($this->webhookUrl($order->order_reference))->assertNoContent();

        $remaining = $cart->items()->get();
        $this->assertCount(1, $remaining);
        $this->assertSame($unrelatedProduct->id, $remaining->first()->product_id);
    }

    public function test_payment_refresh_starts_a_fresh_enkap_order_after_a_failed_payment(): void
    {
        // A dead ("échoué") transaction can't be rechecked back to life —
        // the retry needs an entirely new Enkap order, not another status
        // check against the same failed one. Sequenced (not a plain fake())
        // for the same reason as the "retries enkap initiation" test above.
        Http::fake([
            '*/token' => Http::response(['access_token' => 'fake-token'], 200),
            '*/api/order/status*' => Http::response(['status' => 'FAILED'], 200),
        ]);
        Http::fakeSequence('*/api/order')
            ->push(['orderTransactionId' => 'TXN-1', 'redirectUrl' => 'https://pay.enkap.example/first'], 200)
            ->push(['orderTransactionId' => 'TXN-RETRY-2', 'redirectUrl' => 'https://pay.enkap.example/retry-2'], 200);

        $user = User::factory()->create();
        $this->checkoutOrderViaMobileMoney($user);
        $order = Order::firstOrFail();

        $this->putJson($this->webhookUrl($order->order_reference))->assertNoContent();
        $order->refresh();
        $this->assertSame('échoué', $order->payment->payment_status);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/orders/{$order->order_reference}/payment/refresh")
            ->assertOk();

        $order->refresh();
        $this->assertSame('TXN-RETRY-2', $order->payment->transaction_reference);
        $this->assertSame('https://pay.enkap.example/retry-2', $order->payment->checkout_url);
        // Reset to pending, not stuck on the old "échoué" — otherwise the
        // very next refresh() call would think it still needs a new order
        // instead of actually checking this fresh transaction.
        $this->assertSame('en_attente', $order->payment->payment_status);

        // The actual bug this whole test guards against, confirmed live
        // against the real Enkap API: a second /api/order call reusing the
        // same merchantReference is rejected outright
        // ("OBJECT_ALREADY_EXISTS") — so the retry must send a different one
        // than the order's own (stable) order_reference.
        $this->assertNotSame($order->order_reference, $order->payment->merchant_reference);
        $this->assertStringStartsWith($order->order_reference, $order->payment->merchant_reference);
    }

    public function test_the_webhook_still_finds_the_order_after_a_retry_changed_the_merchant_reference(): void
    {
        Http::fake([
            '*/token' => Http::response(['access_token' => 'fake-token'], 200),
            '*/api/order/status*' => Http::response(['status' => 'SUCCESS'], 200),
        ]);
        Http::fakeSequence('*/api/order')
            ->push(['orderTransactionId' => 'TXN-1', 'redirectUrl' => 'https://pay.enkap.example/first'], 200)
            ->push(['orderTransactionId' => 'TXN-RETRY-2', 'redirectUrl' => 'https://pay.enkap.example/retry-2'], 200);

        $user = User::factory()->create();
        $this->checkoutOrderViaMobileMoney($user);
        $order = Order::firstOrFail();

        // Force the first attempt into "échoué" without going through the
        // webhook (which would use up the FAILED-status fake this test
        // doesn't register) — same technique as the notification tests.
        $order->payment->update(['payment_status' => 'échoué']);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/orders/{$order->order_reference}/payment/refresh")
            ->assertOk();

        $order->refresh();
        $retriedReference = $order->payment->merchant_reference;
        $this->assertNotSame($order->order_reference, $retriedReference);

        // Enkap calls back with the retried reference, not the order's own —
        // the webhook must still resolve it to this order.
        $this->putJson($this->webhookUrl($retriedReference))->assertNoContent();

        $order->refresh();
        $this->assertSame('confirmée', $order->status);
        $this->assertSame('payé', $order->payment->payment_status);
    }
}
