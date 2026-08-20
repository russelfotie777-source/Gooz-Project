<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CashSession\StoreCashSessionRequest;
use App\Http\Requests\CashSession\UpdateCashSessionRequest;
use App\Http\Resources\CashSessionResource;
use App\Models\CashSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class CashSessionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $sessions = CashSession::query()
            ->with(['period:id,name', 'opener:id,name'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);

        return CashSessionResource::collection($sessions);
    }

    public function show(CashSession $cashSession): CashSessionResource
    {
        return new CashSessionResource(
            $cashSession->load(['period', 'opener', 'closer'])
        );
    }

    public function store(StoreCashSessionRequest $request): CashSessionResource
    {
        $data = $request->validated();

        if (CashSession::where('status', 'ouverte')->exists()) {
            throw ValidationException::withMessages([
                'status' => "Une session de caisse est déjà ouverte. Fermez-la avant d'en ouvrir une nouvelle.",
            ]);
        }

        $session = CashSession::create([
            'accounting_period_id' => $data['accounting_period_id'],
            'opened_by' => $request->user()?->id,
            'opening_cash' => $data['opening_cash'],
            'status' => 'ouverte',
            'opened_at' => now(),
        ]);

        return new CashSessionResource($session->load(['period', 'opener']));
    }

    public function update(UpdateCashSessionRequest $request, CashSession $cashSession): CashSessionResource
    {
        if ($cashSession->status === 'fermée') {
            throw ValidationException::withMessages([
                'status' => "Cette session de caisse est déjà fermée.",
            ]);
        }

        $data = $request->validated();

        $cashSession->update([
            'closing_cash' => $data['closing_cash'],
            'notes' => $data['notes'] ?? $cashSession->notes,
            'status' => 'fermée',
            'closed_by' => $request->user()?->id,
            'closed_at' => now(),
        ]);

        return new CashSessionResource($cashSession->fresh(['period', 'opener', 'closer']));
    }

    public function destroy(CashSession $cashSession)
    {
        if ($cashSession->status === 'fermée') {
            throw ValidationException::withMessages([
                'status' => "Une session de caisse fermée ne peut pas être supprimée.",
            ]);
        }

        $cashSession->delete();

        return response()->json(null, 204);
    }
}
