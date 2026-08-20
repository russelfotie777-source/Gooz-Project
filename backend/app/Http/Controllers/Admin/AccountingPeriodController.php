<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AccountingPeriod\StoreAccountingPeriodRequest;
use App\Http\Resources\AccountingPeriodResource;
use App\Models\AccountingPeriod;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class AccountingPeriodController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $periods = AccountingPeriod::query()
            ->with('creator:id,name')
            ->withCount('cashSessions')
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);

        return AccountingPeriodResource::collection($periods);
    }

    public function store(StoreAccountingPeriodRequest $request): AccountingPeriodResource
    {
        $data = $request->validated();

        $period = AccountingPeriod::create([
            'name' => $data['name'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'] ?? null,
            'status' => 'ouverte',
            'created_by' => $request->user()?->id,
        ]);

        return new AccountingPeriodResource($period->load('creator:id,name'));
    }

    public function destroy(AccountingPeriod $accountingPeriod)
    {
        if ($accountingPeriod->cashSessions()->exists()) {
            throw ValidationException::withMessages([
                'accounting_period' => "Cette période comptable a des sessions de caisse et ne peut pas être supprimée.",
            ]);
        }

        $accountingPeriod->delete();

        return response()->json(null, 204);
    }
}
