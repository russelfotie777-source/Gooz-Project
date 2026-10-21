<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\User;
use Tests\TestCase;

class ExpenseTest extends TestCase
{
    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function accounts(): array
    {
        $expenseAccount = Account::create(['code' => 'EXP-ACC', 'name' => 'Charges diverses', 'type' => 'expense']);
        $cashAccount = Account::create(['code' => 'CASH-ACC', 'name' => 'Caisse', 'type' => 'asset']);

        return [$expenseAccount, $cashAccount];
    }

    public function test_admin_can_create_an_expense_with_a_unique_code(): void
    {
        $admin = $this->admin();
        [$expenseAccount, $cashAccount] = $this->accounts();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/expenses', [
            'payee' => 'Électricité SA',
            'expense_account_id' => $expenseAccount->id,
            'paid_from_account_id' => $cashAccount->id,
            'amount' => 15000,
            'date' => now()->toDateString(),
        ]);

        $response->assertCreated();
        $this->assertNotEmpty($response->json('data.code'));
        $this->assertStringStartsWith('EXP-', $response->json('data.code'));
        $this->assertDatabaseCount('expenses', 1);
    }

    /**
     * Idempotency regression: a double-submitted expense form must not
     * create two rows.
     */
    public function test_double_submitted_expense_is_recorded_only_once(): void
    {
        $admin = $this->admin();
        [$expenseAccount, $cashAccount] = $this->accounts();

        $payload = [
            'payee' => 'Fournitures de bureau',
            'expense_account_id' => $expenseAccount->id,
            'paid_from_account_id' => $cashAccount->id,
            'amount' => 7500,
            'date' => now()->toDateString(),
        ];

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/expenses', $payload)->assertCreated();

        $retry = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/expenses', $payload);
        $retry->assertUnprocessable()->assertJsonValidationErrors('duplicate');

        $this->assertDatabaseCount('expenses', 1);
    }

    /**
     * Regression for the code-generation race fix: two DIFFERENT expenses
     * created back to back must still each get a distinct, unique code
     * (previously computed from a racy Expense::max('id') + 1).
     */
    public function test_consecutive_expenses_get_distinct_codes(): void
    {
        $admin = $this->admin();
        [$expenseAccount, $cashAccount] = $this->accounts();

        $first = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/expenses', [
            'payee' => 'Fournisseur A',
            'expense_account_id' => $expenseAccount->id,
            'paid_from_account_id' => $cashAccount->id,
            'amount' => 1000,
            'date' => now()->toDateString(),
        ])->json('data.code');

        $second = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/expenses', [
            'payee' => 'Fournisseur B',
            'expense_account_id' => $expenseAccount->id,
            'paid_from_account_id' => $cashAccount->id,
            'amount' => 2000,
            'date' => now()->toDateString(),
        ])->json('data.code');

        $this->assertNotEquals($first, $second);
    }
}
