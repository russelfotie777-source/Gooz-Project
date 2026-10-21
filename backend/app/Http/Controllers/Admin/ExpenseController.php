<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\PreventsDuplicateSubmission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ExpenseController extends Controller
{
    use PreventsDuplicateSubmission;

    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $expenses = Expense::query()
            ->with(['expenseAccount:id,name', 'paidFromAccount:id,name'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);

        return ExpenseResource::collection($expenses);
    }

    public function show(Expense $expense): ExpenseResource
    {
        return new ExpenseResource(
            $expense->load(['expenseAccount', 'paidFromAccount', 'creator'])
        );
    }

    public function store(StoreExpenseRequest $request): ExpenseResource
    {
        $data = $request->validated();

        // Double-submit guard — a plain create with no existing row/
        // invariant to lock against, so two otherwise-valid expense rows
        // would just both get created.
        $this->rejectIfDuplicateSubmission('expense', [
            'actor' => $request->user()?->id,
            ...$data,
        ]);

        $expense = Expense::create([
            // Placeholder, unique by construction (random, not reused by
            // any other row), immediately replaced below — code's real
            // value depends on this row's own id, which only exists once
            // the insert above completes. `code` is unique+not-null, so it
            // needs *some* value at insert time; computing the real one
            // from Expense::max('id') first (the previous version of this)
            // raced: two concurrent creates could both read the same max()
            // and collide on the same code, crashing the loser with a raw
            // constraint-violation 500 instead of a clean result.
            'code' => 'EXP-TMP-'.Str::random(16),
            'payee' => $data['payee'],
            'expense_account_id' => $data['expense_account_id'],
            'paid_from_account_id' => $data['paid_from_account_id'],
            'amount' => $data['amount'],
            'currency' => 'XAF',
            'date' => $data['date'],
            'status' => 'enregistrée',
            'notes' => $data['notes'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        $expense->update(['code' => 'EXP-'.str_pad((string) $expense->id, 5, '0', STR_PAD_LEFT)]);

        return new ExpenseResource($expense->load(['expenseAccount', 'paidFromAccount', 'creator']));
    }

    public function cancel(Expense $expense): ExpenseResource
    {
        if ($expense->status === 'annulée') {
            throw ValidationException::withMessages([
                'status' => 'Cette dépense est déjà annulée.',
            ]);
        }

        $expense->update(['status' => 'annulée']);

        return new ExpenseResource($expense->fresh(['expenseAccount', 'paidFromAccount', 'creator']));
    }
}
