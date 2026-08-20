<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MoneyMovementResource;
use App\Models\MoneyMovement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Read-only ledger of every money movement (sales, settlements, payouts...).
 * Nothing writes here directly — entries are created by the controllers that
 * actually process the underlying transaction.
 */
class MoneyMovementController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $movements = MoneyMovement::query()
            ->with(['account:id,name', 'cashSession:id', 'creator:id,name'])
            ->when($request->query('account_id'), fn ($q, $id) => $q->where('account_id', $id))
            ->when($request->query('direction'), fn ($q, $direction) => $q->where('direction', $direction))
            ->latest()
            ->paginate($perPage);

        return MoneyMovementResource::collection($movements);
    }

    public function show(MoneyMovement $moneyMovement): MoneyMovementResource
    {
        return new MoneyMovementResource(
            $moneyMovement->load(['account', 'cashSession', 'creator'])
        );
    }
}
