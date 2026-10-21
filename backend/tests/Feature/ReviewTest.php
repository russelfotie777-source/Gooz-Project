<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    public function test_a_signed_in_user_can_leave_a_review(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/products/{$product->id}/reviews", ['rating' => 5, 'comment' => 'Top'])
            ->assertOk();

        $this->assertDatabaseCount('reviews', 1);
    }

    /**
     * Idempotency regression: a user who already has a review for this
     * product gets a clean validation error, not a second row — see the
     * unique(user_id, product_id) constraint this is backed by.
     */
    public function test_a_user_cannot_leave_a_second_review_for_the_same_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/products/{$product->id}/reviews", ['rating' => 5, 'comment' => 'Top'])
            ->assertOk();

        $retry = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/products/{$product->id}/reviews", ['rating' => 1, 'comment' => 'Changed my mind']);

        $retry->assertUnprocessable()->assertJsonValidationErrors('product_id');
        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_two_different_guests_can_both_review_the_same_product(): void
    {
        $product = Product::factory()->create();

        $this->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 4,
            'guest_name' => 'Alice',
        ])->assertOk();

        // Guest reviews have no user_id (NULL) — the unique constraint on
        // (user_id, product_id) must not treat two NULLs as a collision.
        $this->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 3,
            'guest_name' => 'Bob',
        ])->assertOk();

        $this->assertDatabaseCount('reviews', 2);
    }
}
