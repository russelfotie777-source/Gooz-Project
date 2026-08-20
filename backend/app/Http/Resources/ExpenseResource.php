<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'payee' => $this->payee,
            'expense_account' => $this->whenLoaded('expenseAccount', fn () => [
                'id' => $this->expenseAccount->id,
                'name' => $this->expenseAccount->name,
            ]),
            'paid_from_account' => $this->whenLoaded('paidFromAccount', fn () => [
                'id' => $this->paidFromAccount->id,
                'name' => $this->paidFromAccount->name,
            ]),
            'amount' => $this->amount,
            'currency' => $this->currency,
            'date' => $this->date,
            'status' => $this->status,
            'notes' => $this->notes,
            'creator' => $this->whenLoaded('creator', fn () => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ] : null),
            'created_at' => $this->created_at,
        ];
    }
}
