<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
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
}
