<?php

namespace Tests\Feature;

use App\Models\AccountingPeriod;
use App\Models\CashSession;
use App\Models\User;
use Tests\TestCase;

class CashSessionTest extends TestCase
{
    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_open_a_cash_session(): void
    {
        $admin = $this->admin();
        $period = AccountingPeriod::first();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/cash-sessions', [
            'accounting_period_id' => $period->id,
            'opening_cash' => 50000,
        ])->assertCreated();

        $this->assertDatabaseCount('cash_sessions', 1);
    }

    /**
     * Idempotency regression: "at most one open cash session" is a real
     * invariant, enforced here via an atomic Cache::lock() around the
     * check-then-create (there's no existing row to lockForUpdate() against
     * a brand-new INSERT) — a second open attempt while one is already open
     * must be rejected, not open a second concurrent session.
     */
    public function test_a_second_cash_session_cannot_be_opened_while_one_is_already_open(): void
    {
        $admin = $this->admin();
        $period = AccountingPeriod::first();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/cash-sessions', [
            'accounting_period_id' => $period->id,
            'opening_cash' => 50000,
        ])->assertCreated();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/cash-sessions', [
            'accounting_period_id' => $period->id,
            'opening_cash' => 20000,
        ])->assertUnprocessable()->assertJsonValidationErrors('status');

        $this->assertDatabaseCount('cash_sessions', 1);
    }

    public function test_double_submitted_close_does_not_overwrite_a_second_time(): void
    {
        $admin = $this->admin();
        $period = AccountingPeriod::first();
        $session = CashSession::create([
            'accounting_period_id' => $period->id,
            'opened_by' => $admin->id,
            'opening_cash' => 50000,
            'status' => 'ouverte',
            'opened_at' => now(),
        ]);

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/cash-sessions/{$session->id}", ['closing_cash' => 48000])
            ->assertOk();

        $retry = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/cash-sessions/{$session->id}", ['closing_cash' => 1000]);

        $retry->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->assertDatabaseHas('cash_sessions', ['id' => $session->id, 'closing_cash' => '48000.00']);
    }
}
