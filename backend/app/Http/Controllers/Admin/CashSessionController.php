<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CashSession\StoreCashSessionRequest;
use App\Http\Requests\CashSession\UpdateCashSessionRequest;
use App\Http\Resources\CashSessionResource;
use App\Models\CashSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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

        // "At most one open cash session" is a real invariant, but
        // "exists(), then create()" alone can't enforce it: two
        // overlapping requests (double-click on "Ouvrir") can both pass
        // the exists() check before either INSERT lands, opening two
        // concurrent sessions — there's no row to lockForUpdate() yet to
        // close that gap the way the stock/checkout fixes do. Cache::lock()
        // serializes the whole check-then-create block itself instead: the
        // second request waits for the first to finish opening its
        // session, then re-runs exists() and correctly hits the
        // "already open" error below.
        $session = Cache::lock('cash-session:open', 10)->block(5, function () use ($data, $request) {
            if (CashSession::where('status', 'ouverte')->exists()) {
                throw ValidationException::withMessages([
                    'status' => "Une session de caisse est déjà ouverte. Fermez-la avant d'en ouvrir une nouvelle.",
                ]);
            }

            return CashSession::create([
                'accounting_period_id' => $data['accounting_period_id'],
                'opened_by' => $request->user()?->id,
                'opening_cash' => $data['opening_cash'],
                'status' => 'ouverte',
                'opened_at' => now(),
            ]);
        });

        return new CashSessionResource($session->load(['period', 'opener']));
    }

    public function update(UpdateCashSessionRequest $request, CashSession $cashSession): CashSessionResource
    {
        $data = $request->validated();

        // Same reasoning as store(): $cashSession is read before this
        // method runs (route binding), so its ->status can be stale by the
        // time two overlapping "close" requests both reach here. Re-fetch
        // + lock the row itself inside the transaction so the second one
        // serializes behind the first's commit and re-checks the real,
        // current status.
        DB::transaction(function () use ($data, $request, $cashSession) {
            $locked = CashSession::query()->lockForUpdate()->findOrFail($cashSession->id);

            if ($locked->status === 'fermée') {
                throw ValidationException::withMessages([
                    'status' => "Cette session de caisse est déjà fermée.",
                ]);
            }

            $locked->update([
                'closing_cash' => $data['closing_cash'],
                'notes' => $data['notes'] ?? $locked->notes,
                'status' => 'fermée',
                'closed_by' => $request->user()?->id,
                'closed_at' => now(),
            ]);
        });

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
