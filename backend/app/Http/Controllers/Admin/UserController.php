<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreStaffUserRequest;
use App\Http\Requests\User\UpdateUserRoleRequest;
use App\Http\Requests\User\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::query()
            ->withCount(['orders', 'tickets'])
            ->when($request->query('role'), fn ($q, $role) => $q->where('role', $role))
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('q'), fn ($q, $search) => $q->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(20);

        return UserResource::collection($users);
    }

    public function show(User $user): UserResource
    {
        $user->load(['statusHistories.changedBy', 'tickets.assignee', 'tickets.creator']);
        $user->loadCount(['orders', 'tickets']);
        $user->addresses_count = Order::query()
            ->where('user_id', $user->id)
            ->whereNotNull('shipping_address')
            ->distinct('shipping_address')
            ->count('shipping_address');

        return new UserResource($user);
    }

    public function store(StoreStaffUserRequest $request): UserResource
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'phone' => $request->validated('phone'),
            'password' => Hash::make($request->validated('password')),
        ]);

        // 'role' is deliberately excluded from User::$fillable (see
        // updateRole()) so it must be set directly rather than mass-assigned.
        $user->role = $request->validated('role');
        $user->save();

        return new UserResource($user);
    }

    public function destroy(Request $request, User $user)
    {
        abort_if($user->id === $request->user()->id, 422, 'Vous ne pouvez pas supprimer votre propre compte.');

        $user->tokens()->delete();
        $user->delete();

        return response()->json(null, 204);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): UserResource
    {
        // 'role' is deliberately excluded from User::$fillable so it can't be
        // mass-assigned during registration; this admin-gated endpoint is the
        // intended channel to change it, so it bypasses that guard directly.
        $user->role = $request->validated('role');
        $user->save();

        return new UserResource($user);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        abort_if(
            $user->id === $request->user()->id && $request->validated('status') !== 'active',
            422,
            'Vous ne pouvez pas modifier le statut de votre propre compte.'
        );

        $fromStatus = $user->status;
        $toStatus = $request->validated('status');

        $user->status = $toStatus;
        $user->status_reason = $request->validated('reason');
        $user->status_changed_at = now();
        $user->status_changed_by = $request->user()->id;
        // Only an outright block revokes login; restricted/silently-blocked
        // accounts still authenticate so the "silent" part actually holds.
        $user->is_active = $toStatus !== 'blocked';
        $user->save();

        if ($toStatus === 'blocked') {
            $user->tokens()->delete();
        }

        $user->statusHistories()->create([
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'reason' => $request->validated('reason'),
            'changed_by' => $request->user()->id,
        ]);

        return new UserResource($user->fresh(['statusHistories.changedBy']));
    }

    public function verifyPhone(User $user): UserResource
    {
        $user->forceFill(['phone_verified_at' => now()])->save();

        return new UserResource($user);
    }
}
