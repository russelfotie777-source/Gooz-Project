<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use Tests\TestCase;

class StockAdjustmentTest extends TestCase
{
    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function stockedVariant(Warehouse $warehouse, int $quantityAvailable = 10): array
    {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id]);

        Stock::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'warehouse_id' => $warehouse->id,
            'quantity_available' => $quantityAvailable,
        ]);

        return [$product, $variant];
    }

    public function test_creating_an_adjustment_already_applied_updates_stock_once(): void
    {
        $admin = $this->admin();
        $warehouse = Warehouse::factory()->create();
        [$product, $variant] = $this->stockedVariant($warehouse, 10);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/stock-adjustments', [
            'warehouse_id' => $warehouse->id,
            'status' => 'appliqué',
            'lines' => [[
                'product_id' => $product->id,
                'product_variant_id' => $variant->id,
                'delta_quantity' => 5,
            ]],
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.status', 'appliqué');
        $this->assertDatabaseHas('stocks', ['product_variant_id' => $variant->id, 'quantity_available' => 15]);
        $this->assertDatabaseCount('inventory_ledgers', 1);
    }

    /**
     * Idempotency regression: re-submitting the same "apply" update on an
     * adjustment that's already applied must never double the delta.
     * UpdateStockAdjustmentRequest::authorize() already rejects editing an
     * applied adjustment outright (403) — which itself only reliably catches
     * a SEQUENTIAL retry, since route-model-binding re-reads fresh per
     * request. StockAdjustmentController::update() now also locks the
     * adjustment row itself inside the transaction before checking status,
     * which is what closes the gap for two requests whose route binding
     * both resolve to status='brouillon' before either commits (not
     * reproducible here — sqlite's in-memory single connection has no real
     * concurrent locking to exercise, so this test documents the
     * already-covered sequential case).
     */
    public function test_reapplying_an_already_applied_adjustment_is_rejected_and_does_not_double_the_delta(): void
    {
        $admin = $this->admin();
        $warehouse = Warehouse::factory()->create();
        [$product, $variant] = $this->stockedVariant($warehouse, 10);

        $adjustment = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/stock-adjustments', [
            'warehouse_id' => $warehouse->id,
            'status' => 'brouillon',
            'lines' => [[
                'product_id' => $product->id,
                'product_variant_id' => $variant->id,
                'delta_quantity' => 5,
            ]],
        ])->json('data.id');

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/stock-adjustments/{$adjustment}", ['status' => 'appliqué'])
            ->assertOk()
            ->assertJsonPath('data.status', 'appliqué');

        $this->assertDatabaseHas('stocks', ['product_variant_id' => $variant->id, 'quantity_available' => 15]);

        // Retried/double-submitted "apply": rejected outright (already
        // applied), and critically must stay at 15, not jump to 20.
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/stock-adjustments/{$adjustment}", ['status' => 'appliqué'])
            ->assertForbidden();

        $this->assertDatabaseHas('stocks', ['product_variant_id' => $variant->id, 'quantity_available' => 15]);
        $this->assertDatabaseCount('inventory_ledgers', 1);
    }

    public function test_bulk_set_moves_every_variant_to_the_target_quantity(): void
    {
        $admin = $this->admin();
        $warehouse = Warehouse::factory()->create();
        [, $variantA] = $this->stockedVariant($warehouse, 3);
        [, $variantB] = $this->stockedVariant($warehouse, 30);

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/stock-adjustments/bulk-set', [
            'warehouse_id' => $warehouse->id,
            'quantity' => 10,
        ])->assertCreated();

        $this->assertDatabaseHas('stocks', ['product_variant_id' => $variantA->id, 'quantity_available' => 10]);
        $this->assertDatabaseHas('stocks', ['product_variant_id' => $variantB->id, 'quantity_available' => 10]);
    }

    /**
     * Idempotency regression: calling bulk-set again with the same target
     * must converge/stay at that target, not add the delta on top again.
     */
    public function test_repeated_bulk_set_to_the_same_target_stays_at_that_target(): void
    {
        $admin = $this->admin();
        $warehouse = Warehouse::factory()->create();
        [, $variant] = $this->stockedVariant($warehouse, 3);

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/stock-adjustments/bulk-set', [
            'warehouse_id' => $warehouse->id,
            'quantity' => 10,
        ])->assertCreated();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/stock-adjustments/bulk-set', [
            'warehouse_id' => $warehouse->id,
            'quantity' => 10,
        ])->assertCreated();

        $this->assertDatabaseHas('stocks', ['product_variant_id' => $variant->id, 'quantity_available' => 10]);
    }
}
