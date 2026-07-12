<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateUserRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::query()
            ->when($request->query('role'), fn ($q, $role) => $q->where('role', $role))
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
        return new UserResource($user);
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

    public function suspend(Request $request, User $user)
    {
        abort_if($user->id === $request->user()->id, 422, 'Vous ne pouvez pas suspendre votre propre compte.');

        $user->forceFill(['is_active' => false])->save();
        $user->tokens()->delete();

        return new UserResource($user);
    }

    public function reactivate(User $user): UserResource
    {
        $user->forceFill(['is_active' => true])->save();

        return new UserResource($user);
    }
}
