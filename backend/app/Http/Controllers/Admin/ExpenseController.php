<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class ExpenseController extends Controller
{
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

        $expense = Expense::create([
            'code' => 'EXP-'.str_pad((string) (Expense::max('id') + 1), 5, '0', STR_PAD_LEFT),
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
