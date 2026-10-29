<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\DeleteAccountRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
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
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        // RegisterRequest's own unique:users,phone rule already catches
        // the common sequential case cleanly — this only matters under
        // real concurrency (two signups for the same phone validated at
        // nearly the same instant, both seeing "not taken" before either
        // commits): the loser hits the DB's own unique constraint instead,
        // which — uncaught — would otherwise surface as a raw 500 rather
        // than the same clean validation error. Same pattern as social()
        // below, for its own email-uniqueness race.
        try {
            $user = User::create([
                'name' => $request->validated('name'),
                'phone' => $request->validated('phone'),
                'password' => Hash::make($request->validated('password')),
                'recovery_email' => $request->validated('recovery_email'),
            ]);
        } catch (QueryException $e) {
            throw ValidationException::withMessages([
                'phone' => ['Ce numéro de téléphone est déjà associé à un compte.'],
            ]);
        }

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

        // Same message whether the phone doesn't exist, the password is
        // wrong, OR the account is suspended — a distinct "this account is
        // suspended" response would let anyone confirm a given phone number
        // belongs to a real (if blocked) account, just by trying to log
        // into it. The suspended user still can't get a token either way.
        if (! $user || ! Hash::check($request->validated('password'), $user->password) || ! $user->is_active) {
            throw ValidationException::withMessages([
                'phone' => ['Les identifiants fournis sont incorrects.'],
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
            'recovery_email' => $request->validated('recovery_email'),
        ])->save();

        return new UserResource($user);
    }

    // Deliberately identical response whether `phone` doesn't exist, belongs
    // to a Firebase account, or has no recovery_email on file — telling any
    // of those apart would let this endpoint be used to probe which phone
    // numbers have accounts (same reasoning as login() above). Nothing is
    // actually sent in any of those cases; Password::sendResetLink() is
    // only reached once a recovery_email is confirmed to exist.
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('phone', $request->validated('phone'))->first();

        if ($user && $user->recovery_email) {
            Password::sendResetLink(['phone' => $user->phone]);
        }

        return response()->json([
            'message' => 'Si ce numéro est associé à un compte avec un email de récupération, un lien de réinitialisation vient d\'y être envoyé.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('phone', 'token', 'password', 'password_confirmation'),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                // Matches destroy()'s own reasoning: a reset password should
                // invalidate every session a possible attacker (the reason
                // for the reset in the first place) might already hold.
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => ['Ce lien de réinitialisation est invalide ou a expiré.'],
            ]);
        }

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
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
