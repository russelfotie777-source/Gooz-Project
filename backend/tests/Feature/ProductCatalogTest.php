<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductView;
use App\Models\User;
use Tests\TestCase;

class ProductCatalogTest extends TestCase
{
    public function test_product_listing_only_returns_active_products(): void
    {
        $active = Product::factory()->create(['name' => 'Visible']);
        Product::factory()->inactive()->create(['name' => 'Hidden']);

        $response = $this->getJson('/api/v1/products');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($active->id));
        $this->assertCount(1, $ids);
    }

    public function test_inactive_product_detail_404s(): void
    {
        $product = Product::factory()->inactive()->create();

        $this->getJson("/api/v1/products/{$product->id}")->assertNotFound();
    }

    public function test_active_product_detail_is_reachable(): void
    {
        $product = Product::factory()->create();

        $this->getJson("/api/v1/products/{$product->id}")->assertOk()->assertJsonPath('data.id', $product->id);
    }

    public function test_inactive_variant_is_hidden_from_product_detail(): void
    {
        $product = Product::factory()->create();
        $visible = ProductVariant::factory()->for($product)->create();
        $hidden = ProductVariant::factory()->for($product)->inactive()->create();

        $response = $this->getJson("/api/v1/products/{$product->id}")->assertOk();

        $ids = collect($response->json('data.variants'))->pluck('id');
        $this->assertTrue($ids->contains($visible->id));
        $this->assertFalse($ids->contains($hidden->id));
    }

    public function test_inactive_variant_is_hidden_from_product_listing(): void
    {
        $product = Product::factory()->create();
        $visible = ProductVariant::factory()->for($product)->create();
        ProductVariant::factory()->for($product)->inactive()->create();

        $response = $this->getJson('/api/v1/products')->assertOk();

        $entry = collect($response->json('data'))->firstWhere('id', $product->id);
        $ids = collect($entry['variants'])->pluck('id');
        $this->assertEquals([$visible->id], $ids->all());
    }

    public function test_category_listing_only_returns_active_categories(): void
    {
        $active = Category::factory()->create(['name' => 'Visible']);
        Category::factory()->inactive()->create(['name' => 'Hidden']);

        $response = $this->getJson('/api/v1/categories');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($active->id));
        $this->assertCount(1, $ids);
    }

    public function test_inactive_category_detail_404s(): void
    {
        // Pins the is_active fix made to CategoryController::show() — it
        // used to serve inactive categories fine (200), inconsistent with
        // ProductController::show()'s already-correct behaviour.
        $category = Category::factory()->inactive()->create();

        $this->getJson("/api/v1/categories/{$category->id}")->assertNotFound();
    }

    public function test_active_category_detail_is_reachable(): void
    {
        $category = Category::factory()->create();

        $this->getJson("/api/v1/categories/{$category->id}")->assertOk()->assertJsonPath('data.id', $category->id);
    }

    public function test_category_listing_counts_only_active_products(): void
    {
        // ProductFactory attaches each product to an existing category —
        // with only this one in the table, all three land in it.
        Category::factory()->create();
        Product::factory()->count(2)->create();
        Product::factory()->inactive()->create();

        $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonPath('data.0.products_count', 2);
    }

    public function test_products_can_be_sorted_by_best_sellers(): void
    {
        $rarelySold = Product::factory()->create();
        $bestSeller = Product::factory()->create();
        $neverSold = Product::factory()->create();

        $order = Order::create([
            'user_id' => User::factory()->create()->id,
            'order_reference' => 'ORD-TEST-'.uniqid(),
            'status' => 'confirmée',
            'total_amount' => 10000,
            'discount_amount' => 0,
            'delivery_fees' => 0,
            'delivery_method' => 'retrait',
            'shipping_phone' => '670000000',
        ]);
        foreach ([[$rarelySold, 1], [$bestSeller, 5]] as [$product, $quantity]) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => 1000,
            ]);
        }

        $ids = collect($this->getJson('/api/v1/products?sort_by=best_sellers&sort_dir=desc')->assertOk()->json('data'))
            ->pluck('id')
            ->all();

        $this->assertSame([$bestSeller->id, $rarelySold->id, $neverSold->id], $ids);
    }

    public function test_products_can_be_sorted_by_recent_views(): void
    {
        $popular = Product::factory()->create();
        $onlyOldViews = Product::factory()->create();
        $quiet = Product::factory()->create();

        foreach ([[$popular, 3, 1], [$onlyOldViews, 5, 60], [$quiet, 1, 2]] as [$product, $count, $daysAgo]) {
            for ($i = 0; $i < $count; $i++) {
                ProductView::create([
                    'product_id' => $product->id,
                    'session_token' => uniqid('s', true),
                    'created_at' => now()->subDays($daysAgo),
                ]);
            }
        }

        $ids = collect($this->getJson('/api/v1/products?sort_by=most_viewed&sort_dir=desc')->assertOk()->json('data'))
            ->pluck('id')
            ->all();

        // Views older than the 30-day window don't count.
        $this->assertSame([$popular->id, $quiet->id, $onlyOldViews->id], $ids);
    }

    public function test_products_can_be_sorted_by_discount(): void
    {
        $small = Product::factory()->create();
        ProductVariant::factory()->for($small)->onPromotion(9000)->create(['base_price' => 10000]);
        $big = Product::factory()->create();
        ProductVariant::factory()->for($big)->onPromotion(4000)->create(['base_price' => 10000]);
        $none = Product::factory()->create();
        ProductVariant::factory()->for($none)->create(['base_price' => 10000]);

        $ids = collect($this->getJson('/api/v1/products?sort_by=discount&sort_dir=desc')->assertOk()->json('data'))
            ->pluck('id')
            ->all();

        $this->assertSame([$big->id, $small->id, $none->id], $ids);
    }
}
