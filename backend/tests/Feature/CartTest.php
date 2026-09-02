<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use Tests\TestCase;

class CartTest extends TestCase
{
    private function stockedProduct(int $available = 10): Product
    {
        $product = Product::factory()->create();

        Stock::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => null,
            'warehouse_id' => Warehouse::factory(),
            'quantity_available' => $available,
            'quantity_reserved' => 0,
        ]);

        return $product;
    }

    public function test_adding_an_item_creates_a_cart_item(): void
    {
        $user = User::factory()->create();
        $product = $this->stockedProduct();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response->assertCreated()->assertJsonPath('data.items.0.quantity', 2);
        $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 2]);
    }

    public function test_adding_the_same_product_twice_accumulates_the_quantity(): void
    {
        $user = User::factory()->create();
        $product = $this->stockedProduct(10);

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertCreated();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        // Second call reuses the existing cart_items row (firstOrNew) — an
        // update, not a create, hence 200 here vs 201 for the first add.
        $response->assertOk();
        $this->assertDatabaseCount('cart_items', 1);
        $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 5]);
    }

    public function test_adding_an_inactive_product_is_rejected(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->inactive()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('product_id');
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_adding_more_than_available_stock_is_rejected(): void
    {
        $user = User::factory()->create();
        $product = $this->stockedProduct(3);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('quantity');
        $this->assertStringContainsString('Stock insuffisant. Disponible : 3', $response->json('errors.quantity.0'));
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_updating_quantity_re_checks_stock(): void
    {
        $user = User::factory()->create();
        $product = $this->stockedProduct(3);

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertCreated();

        $cartItem = CartItem::where('product_id', $product->id)->firstOrFail();

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/v1/cart/items/{$cartItem->id}", [
            'quantity' => 10,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('quantity');
        $this->assertDatabaseHas('cart_items', ['id' => $cartItem->id, 'quantity' => 2]);
    }

    public function test_removing_an_item_deletes_it(): void
    {
        $user = User::factory()->create();
        $product = $this->stockedProduct();

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertCreated();

        $cartItem = CartItem::where('product_id', $product->id)->firstOrFail();

        $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/cart/items/{$cartItem->id}")->assertNoContent();
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_a_user_cannot_modify_another_users_cart_item(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $product = $this->stockedProduct();

        $this->actingAs($owner, 'sanctum')->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertCreated();

        $cartItem = CartItem::where('product_id', $product->id)->firstOrFail();

        $this->actingAs($intruder, 'sanctum')
            ->putJson("/api/v1/cart/items/{$cartItem->id}", ['quantity' => 2])
            ->assertForbidden();

        $this->actingAs($intruder, 'sanctum')
            ->deleteJson("/api/v1/cart/items/{$cartItem->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('cart_items', ['id' => $cartItem->id, 'quantity' => 1]);
    }
}
