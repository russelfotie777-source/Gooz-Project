<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\DeleteAccountRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'phone' => $request->validated('phone'),
            'password' => Hash::make($request->validated('password')),
        ]);

        $token = $user->createToken($request->userAgent() ?? 'api')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('phone', $request->validated('phone'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'phone' => ['Ce compte a été suspendu.'],
            ]);
        }

        $deviceName = $request->validated('device_name') ?? $request->userAgent() ?? 'api';
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(null, 204);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function destroy(DeleteAccountRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Mot de passe incorrect.'],
            ]);
        }

        DB::transaction(function () use ($user) {
            // Orders/reviews are kept for accounting/history purposes and now
            // point to an anonymized account instead of being cascade-deleted.
            $user->forceFill([
                'name' => 'Utilisateur supprimé',
                'phone' => 'deleted_'.$user->id.'_'.Str::random(8),
                'is_active' => false,
            ])->save();

            $user->carts()->delete();
            $user->deviceTokens()->delete();
            $user->tokens()->delete();

            $user->delete();
        });

        return response()->json(null, 204);
    }
}
