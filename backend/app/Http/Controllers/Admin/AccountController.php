<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreAccountRequest;
use App\Http\Requests\Account\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AccountController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $accounts = Account::query()
            ->with('creator:id,name')
            ->when($request->query('type'), fn ($q, $type) => $q->where('type', $type))
            ->latest()
            ->paginate($perPage);

        return AccountResource::collection($accounts);
    }

    public function show(Account $account): AccountResource
    {
        return new AccountResource($account->load('creator:id,name'));
    }

    public function store(StoreAccountRequest $request): AccountResource
    {
        $data = $request->validated();

        $account = Account::create([
            'code' => $data['code'],
            'name' => $data['name'],
            'type' => $data['type'],
            'is_active' => $data['is_active'] ?? true,
            'created_by' => $request->user()?->id,
        ]);

        return new AccountResource($account->load('creator:id,name'));
    }

    public function update(UpdateAccountRequest $request, Account $account): AccountResource
    {
        $data = $request->validated();

        $account->update([
            'code' => $data['code'],
            'name' => $data['name'],
            'type' => $data['type'],
            'is_active' => $data['is_active'] ?? $account->is_active,
        ]);

        return new AccountResource($account->fresh('creator:id,name'));
    }

    public function destroy(Account $account)
    {
        $account->delete();

        return response()->json(null, 204);
    }
}
