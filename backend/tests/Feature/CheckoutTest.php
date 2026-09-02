<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    /** Cash payment throughout — keeps these tests clear of Enkap/Http entirely; see EnkapPaymentTest for that. */
    private const CASH = 'espèces';

    private function cartWithStockedVariant(User $user, int $quantity = 1, int $stockAvailable = 10): array
    {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 5000]);

        Stock::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'warehouse_id' => Warehouse::factory(),
            'quantity_available' => $stockAvailable,
            'quantity_reserved' => 0,
        ]);

        $cart = $user->carts()->create(['is_active' => true]);

        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => $quantity,
        ]);

        return [$cart, $product, $variant];
    }

    public function test_pickup_checkout_succeeds_with_no_delivery_fee(): void
    {
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();
        [$cart, , $variant] = $this->cartWithStockedVariant($user, quantity: 2, stockAvailable: 10);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/checkout', [
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000010',
            'payment_method' => self::CASH,
            'warehouse_id' => $warehouse->id,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.delivery_fees', '0.00');
        $response->assertJsonPath('data.status', 'en_attente');
        $response->assertJsonPath('data.total_amount', number_format($variant->base_price * 2, 2, '.', ''));

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('payments', ['payment_method' => self::CASH, 'payment_status' => 'en_attente']);
        $this->assertDatabaseHas('stocks', ['product_variant_id' => $variant->id, 'quantity_available' => 8]);
        $this->assertDatabaseHas('carts', ['id' => $cart->id, 'is_active' => false]);
    }

    public function test_home_delivery_checkout_computes_a_positive_delivery_fee(): void
    {
        $user = User::factory()->create();
        // A warehouse with real coordinates so DeliveryFeeCalculator has
        // something to measure a distance against — a few km from the
        // shipping point used below, not the exact same spot.
        Warehouse::factory()->create(['latitude' => 4.05, 'longitude' => 9.70]);
        [, , $variant] = $this->cartWithStockedVariant($user, quantity: 1, stockAvailable: 10);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/checkout', [
            'delivery_method' => 'livraison',
            'shipping_phone' => '670000011',
            'payment_method' => self::CASH,
            'shipping_address' => 'Akwa, Douala',
            'shipping_latitude' => 4.06,
            'shipping_longitude' => 9.72,
        ]);

        $response->assertCreated();

        $subtotal = (float) $variant->base_price;
        $deliveryFee = (float) $response->json('data.delivery_fees');
        $total = (float) $response->json('data.total_amount');

        $this->assertGreaterThan(0, $deliveryFee);
        $this->assertEqualsWithDelta($subtotal + $deliveryFee, $total, 0.01);
    }

    public function test_checkout_fails_with_an_empty_cart(): void
    {
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/checkout', [
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000012',
            'payment_method' => self::CASH,
            'warehouse_id' => $warehouse->id,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('cart');
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_fails_and_changes_nothing_when_stock_is_insufficient(): void
    {
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();
        [, , $variant] = $this->cartWithStockedVariant($user, quantity: 5, stockAvailable: 2);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/checkout', [
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000013',
            'payment_method' => self::CASH,
            'warehouse_id' => $warehouse->id,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('stock');

        // The whole DB::transaction() in CheckoutController::store() must
        // have rolled back — no partial order, no partial stock decrement.
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('payments', 0);
        $this->assertDatabaseHas('stocks', ['product_variant_id' => $variant->id, 'quantity_available' => 2]);
    }

    public function test_checkout_applies_a_valid_coupon_and_increments_its_usage(): void
    {
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();
        [, , $variant] = $this->cartWithStockedVariant($user, quantity: 2, stockAvailable: 10);
        $coupon = Coupon::factory()->percentage(10)->create(['code' => 'CHECKOUT10']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/checkout', [
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000014',
            'payment_method' => self::CASH,
            'warehouse_id' => $warehouse->id,
            'coupon_code' => 'checkout10',
        ]);

        $response->assertCreated();

        $subtotal = (float) $variant->base_price * 2;
        $expectedDiscount = round($subtotal * 0.10, 2);

        $response->assertJsonPath('data.discount_amount', number_format($expectedDiscount, 2, '.', ''));
        $response->assertJsonPath('data.total_amount', number_format($subtotal - $expectedDiscount, 2, '.', ''));
        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'used_count' => 1]);
        $this->assertDatabaseHas('orders', ['coupon_id' => $coupon->id]);
    }

    public function test_checkout_rejects_an_invalid_coupon_without_creating_an_order(): void
    {
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();
        $this->cartWithStockedVariant($user, quantity: 1, stockAvailable: 10);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/checkout', [
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000015',
            'payment_method' => self::CASH,
            'warehouse_id' => $warehouse->id,
            'coupon_code' => 'DOESNOTEXIST',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('coupon_code');
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_pickup_checkout_requires_an_active_warehouse(): void
    {
        $user = User::factory()->create();
        $inactiveWarehouse = Warehouse::factory()->inactive()->create();
        $this->cartWithStockedVariant($user, quantity: 1, stockAvailable: 10);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/checkout', [
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000016',
            'payment_method' => self::CASH,
            'warehouse_id' => $inactiveWarehouse->id,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('warehouse_id');
    }

    public function test_checkout_requires_a_variant_on_every_cart_item(): void
    {
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();
        $product = Product::factory()->create();

        $cart = $user->carts()->create(['is_active' => true]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => null,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/checkout', [
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000017',
            'payment_method' => self::CASH,
            'warehouse_id' => $warehouse->id,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('cart');
        $this->assertDatabaseCount('orders', 0);
    }
}
