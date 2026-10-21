<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use Tests\TestCase;

class PurchaseInvoiceTest extends TestCase
{
    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function openPurchaseOrderWithLine(int $quantityOrdered = 10): array
    {
        $supplier = Supplier::create([
            'company_name' => 'Fournisseur Test',
            'contact_name' => 'Jean',
            'phone' => '670000000',
            'adresse' => 'Douala',
        ]);

        $order = PurchaseOrder::create([
            'code' => 'BC-TEST-'.uniqid(),
            'supplier_id' => $supplier->id,
            'currency' => 'XAF',
            'status' => 'ouverte',
        ]);

        $product = Product::factory()->create();
        $line = $order->lines()->create([
            'product_id' => $product->id,
            'quantity_ordered' => $quantityOrdered,
            'unit_price' => 1000,
        ]);

        return [$order, $line];
    }

    public function test_admin_can_create_a_purchase_invoice_with_a_unique_code(): void
    {
        $admin = $this->admin();
        [$order, $line] = $this->openPurchaseOrderWithLine(10);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/purchase-invoices', [
            'purchase_order_id' => $order->id,
            'invoice_date' => now()->toDateString(),
            'lines' => [[
                'purchase_order_line_id' => $line->id,
                'quantity' => 4,
            ]],
        ]);

        $response->assertCreated();
        $this->assertStringStartsWith('FA-', $response->json('data.code'));
        $this->assertDatabaseHas('purchase_order_lines', ['id' => $line->id, 'quantity_invoiced' => 4]);
    }

    /**
     * Idempotency regression: double-submitting the same invoice (well
     * under the billable ceiling, so the existing over-invoicing guard
     * alone wouldn't catch it) must not create two invoices.
     */
    public function test_double_submitted_purchase_invoice_is_created_only_once(): void
    {
        $admin = $this->admin();
        [$order, $line] = $this->openPurchaseOrderWithLine(10);

        $payload = [
            'purchase_order_id' => $order->id,
            'invoice_date' => now()->toDateString(),
            'lines' => [[
                'purchase_order_line_id' => $line->id,
                'quantity' => 2,
            ]],
        ];

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/purchase-invoices', $payload)->assertCreated();

        $retry = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/purchase-invoices', $payload);
        $retry->assertUnprocessable()->assertJsonValidationErrors('duplicate');

        $this->assertDatabaseCount('purchase_invoices', 1);
        $this->assertDatabaseHas('purchase_order_lines', ['id' => $line->id, 'quantity_invoiced' => 2]);
    }
}
