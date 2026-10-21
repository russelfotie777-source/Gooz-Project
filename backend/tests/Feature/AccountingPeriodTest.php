<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class AccountingPeriodTest extends TestCase
{
    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_create_an_accounting_period(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/accounting-periods', [
            'name' => 'Novembre 2026',
            'start_date' => '2026-11-01',
        ])->assertCreated();

        // +1: the migration seeds a default "Période par défaut" row.
        $this->assertDatabaseCount('accounting_periods', 2);
    }

    /**
     * Idempotency regression: double-submitting the "create period" form
     * must not create two identical periods.
     */
    public function test_double_submitted_accounting_period_is_created_only_once(): void
    {
        $admin = $this->admin();

        $payload = ['name' => 'Décembre 2026', 'start_date' => '2026-12-01'];

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/accounting-periods', $payload)->assertCreated();

        $retry = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/accounting-periods', $payload);
        $retry->assertUnprocessable()->assertJsonValidationErrors('duplicate');

        $this->assertDatabaseCount('accounting_periods', 2);
    }
}
