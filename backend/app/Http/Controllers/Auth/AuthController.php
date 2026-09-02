<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\DeleteAccountRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\SocialAuthRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\FirebaseIdTokenVerifier;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'phone' => $request->validated('phone'),
            'password' => Hash::make($request->validated('password')),
        ]);

        // is_active/role/status aren't mass-assignable and are never set
        // above — without this, UserResource below would serialize them as
        // null in the signup response (the row itself is fine, only this
        // in-memory copy is missing the DB's own defaults). Same fix as
        // social() just above.
        $user->refresh();

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

    // Any Firebase-issued sign-in (Firebase Auth on the frontend hands us its
    // ID token; we never see the provider's own secrets — Firebase does that
    // exchange) — Google/Facebook popup, or email+password
    // (sign_in_provider "password", frontend: signInWithEmail/
    // registerWithEmail). First sign-in for a given firebase_uid creates the
    // account with phone left null (follow-up collects it — see
    // CompletePhoneModal on the frontend); every later sign-in from the same
    // provider account just re-authenticates it.
    public function social(SocialAuthRequest $request, FirebaseIdTokenVerifier $verifier): JsonResponse
    {
        try {
            $claims = $verifier->verify($request->validated('id_token'));
        } catch (RuntimeException $e) {
            throw ValidationException::withMessages([
                'id_token' => [$e->getMessage()],
            ]);
        }

        $uid = $claims['sub'];
        $provider = $claims['firebase']['sign_in_provider'] ?? 'unknown';
        $wasExisting = true;

        $user = User::where('firebase_uid', $uid)->first();

        if (! $user) {
            $wasExisting = false;

            try {
                $user = User::create([
                    'name' => $claims['name'] ?? 'Utilisateur',
                    'phone' => null,
                    'email' => $claims['email'] ?? null,
                    'password' => Hash::make(Str::random(40)),
                    'firebase_uid' => $uid,
                    'auth_provider' => $provider,
                ]);
                // is_active isn't mass-assignable and was never set above, so
                // without this the in-memory $user still has it unset/null
                // right after create() — the is_active check just below would
                // then reject every brand-new signup as "suspended", even
                // though the row itself correctly got the column's DB
                // default. refresh() pulls that (and any other DB-computed
                // default) back in.
                $user->refresh();
            } catch (QueryException $e) {
                // Unique constraint on `email` — another account (a
                // different firebase_uid) already claimed it.
                throw ValidationException::withMessages([
                    'id_token' => ['Cet email est déjà associé à un autre compte.'],
                ]);
            }
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'id_token' => ['Ce compte a été suspendu.'],
            ]);
        }

        $deviceName = $request->validated('device_name') ?? $request->userAgent() ?? 'api';
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], $wasExisting ? 200 : 201);
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

    public function updateProfile(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();

        $user->forceFill([
            'name' => $request->validated('name'),
            'phone' => $request->validated('phone'),
        ])->save();

        return new UserResource($user);
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
