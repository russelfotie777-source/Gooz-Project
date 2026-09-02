<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Tests\TestCase;

class FavoriteTest extends TestCase
{
    public function test_a_shopper_can_favorite_a_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        ProductVariant::factory()->create(['product_id' => $product->id, 'base_price' => 5000]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/favorites/{$product->id}")
            ->assertCreated()
            ->assertJsonPath('data.product.id', $product->id);

        $this->assertDatabaseHas('favorites', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'last_seen_price' => 5000,
        ]);
    }

    public function test_favoriting_the_same_product_twice_does_not_duplicate_it(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        ProductVariant::factory()->create(['product_id' => $product->id]);

        $this->actingAs($user, 'sanctum')->postJson("/api/v1/favorites/{$product->id}")->assertCreated();
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/favorites/{$product->id}")->assertOk();

        $this->assertDatabaseCount('favorites', 1);
    }

    public function test_a_shopper_can_remove_a_favorite(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        ProductVariant::factory()->create(['product_id' => $product->id]);
        $user->favorites()->create(['product_id' => $product->id, 'last_seen_price' => 1000]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/favorites/{$product->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('favorites', ['user_id' => $user->id, 'product_id' => $product->id]);
    }

    public function test_a_shopper_only_sees_their_own_favorites(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::factory()->create();
        ProductVariant::factory()->create(['product_id' => $product->id]);

        $user->favorites()->create(['product_id' => $product->id, 'last_seen_price' => 1000]);
        $otherUser->favorites()->create(['product_id' => $product->id, 'last_seen_price' => 1000]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/favorites')->assertOk();

        $this->assertCount(1, $response->json('data'));
    }

    public function test_guests_cannot_access_favorites(): void
    {
        $product = Product::factory()->create();

        $this->postJson("/api/v1/favorites/{$product->id}")->assertUnauthorized();
        $this->getJson('/api/v1/favorites')->assertUnauthorized();
    }
}
