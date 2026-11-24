<?php

namespace Tests\Feature;

use App\Models\InventoryLedger;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Warehouse;
use Tests\TestCase;

/**
 * inventory_ledgers.product_id/product_variant_id use onDelete('restrict')
 * to protect stock history — any product/variant with a recorded movement
 * can't be hard-deleted. Before this test, that bubbled up as a raw,
 * unhandled QueryException (500) instead of an actionable error pointing
 * the admin at the existing "Désactiver" (is_active) toggle.
 */
class ProductDeletionTest extends TestCase
{
    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function logMovement(Product $product, ?ProductVariant $variant = null): void
    {
        $warehouse = Warehouse::factory()->create();

        InventoryLedger::create([
            'warehouse_id' => $warehouse->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant?->id,
            'movement_type' => 'receipt',
            'quantity_delta' => 10,
            'quantity_before' => 0,
            'quantity_after' => 10,
        ]);
    }

    public function test_deleting_a_product_with_stock_history_returns_a_friendly_409(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create();
        $this->logMovement($product);

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/products/{$product->id}");

        $response->assertStatus(409);
        $response->assertJsonPath('message', 'Ce produit a un historique de stock (ventes, réceptions, ajustements) et ne peut pas être supprimé. Désactivez-le à la place pour le retirer du catalogue.');
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_deleting_a_product_without_stock_history_still_works(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/products/{$product->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_deleting_a_variant_with_stock_history_returns_a_friendly_409(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create();
        $this->logMovement($product, $variant);

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/variants/{$variant->id}");

        $response->assertStatus(409);
        $response->assertJsonPath('message', 'Cette variante a un historique de stock (ventes, réceptions, ajustements) et ne peut pas être supprimée. Désactivez-la à la place pour la retirer du catalogue.');
        $this->assertDatabaseHas('product_variants', ['id' => $variant->id]);
    }

    public function test_deleting_a_variant_without_stock_history_still_works(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/variants/{$variant->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('product_variants', ['id' => $variant->id]);
    }
}
