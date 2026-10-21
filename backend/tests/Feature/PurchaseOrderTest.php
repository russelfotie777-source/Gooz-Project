<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Tests\TestCase;

class PurchaseOrderTest extends TestCase
{
    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function supplier(): Supplier
    {
        return Supplier::create([
            'company_name' => 'Fournisseur Test',
            'contact_name' => 'Jean',
            'phone' => '670000000',
            'adresse' => 'Douala',
        ]);
    }

    public function test_admin_can_create_a_purchase_order_with_a_unique_code(): void
    {
        $admin = $this->admin();
        $supplier = $this->supplier();
        $product = Product::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/purchase-orders', [
            'supplier_id' => $supplier->id,
            'lines' => [[
                'product_id' => $product->id,
                'quantity_ordered' => 10,
                'unit_price' => 2000,
            ]],
        ]);

        $response->assertCreated();
        $this->assertStringStartsWith('BC-', $response->json('data.code'));
        $this->assertDatabaseCount('purchase_orders', 1);
    }

    /**
     * Idempotency regression: a double-submitted purchase order form must
     * not create two separate orders.
     */
    public function test_double_submitted_purchase_order_is_created_only_once(): void
    {
        $admin = $this->admin();
        $supplier = $this->supplier();
        $product = Product::factory()->create();

        $payload = [
            'supplier_id' => $supplier->id,
            'lines' => [[
                'product_id' => $product->id,
                'quantity_ordered' => 10,
                'unit_price' => 2000,
            ]],
        ];

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/purchase-orders', $payload)->assertCreated();

        $retry = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/purchase-orders', $payload);
        $retry->assertUnprocessable()->assertJsonValidationErrors('duplicate');

        $this->assertDatabaseCount('purchase_orders', 1);
    }
}
