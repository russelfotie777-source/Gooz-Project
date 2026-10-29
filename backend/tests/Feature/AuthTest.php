<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Services\FirebaseIdTokenVerifier;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_register_creates_an_account_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Awa Fon',
            'phone' => '670000001',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()->assertJsonStructure(['user' => ['id', 'name', 'phone'], 'token']);
        $this->assertDatabaseHas('users', ['phone' => '670000001', 'name' => 'Awa Fon']);
        // Pins a real bug found while writing this test: is_active/role
        // aren't mass-assignable and weren't set explicitly, so without
        // User::refresh() in the controller this response serialized them
        // as null instead of the database's own defaults.
        $response->assertJsonPath('user.is_active', true)->assertJsonPath('user.role', 'customer');
    }

    public function test_register_accepts_an_optional_recovery_email(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Awa Fon',
            'phone' => '670000011',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'recovery_email' => 'awa@example.com',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['phone' => '670000011', 'recovery_email' => 'awa@example.com']);
    }

    public function test_register_rejects_a_phone_number_already_in_use(): void
    {
        User::factory()->create(['phone' => '670000002']);

        $response = $this->postJson('/api/v1/register', [
            'name' => 'Someone Else',
            'phone' => '670000002',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('phone');
    }

    public function test_login_succeeds_with_correct_credentials(): void
    {
        User::factory()->create(['phone' => '670000003', 'password' => Hash::make('password')]);

        $response = $this->postJson('/api/v1/login', ['phone' => '670000003', 'password' => 'password']);

        $response->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_login_rejects_wrong_password(): void
    {
        User::factory()->create(['phone' => '670000004', 'password' => Hash::make('password')]);

        $response = $this->postJson('/api/v1/login', ['phone' => '670000004', 'password' => 'wrong-password']);

        $response->assertUnprocessable()->assertJsonValidationErrors('phone');
    }

    public function test_login_rejects_unknown_phone_number(): void
    {
        $response = $this->postJson('/api/v1/login', ['phone' => '699999999', 'password' => 'whatever1']);

        $response->assertUnprocessable()->assertJsonValidationErrors('phone');
    }

    /**
     * A suspended account's login is still rejected, but with the exact
     * same generic message as a wrong password/unknown phone — a distinct
     * "this account is suspended" response would let anyone confirm a
     * given phone number belongs to a real account just by trying to log
     * into it.
     */
    public function test_login_rejects_a_suspended_account_with_the_generic_message(): void
    {
        User::factory()->suspended()->create(['phone' => '670000005', 'password' => Hash::make('password')]);

        $wrongPhone = $this->postJson('/api/v1/login', ['phone' => '670099999', 'password' => 'password']);
        $suspended = $this->postJson('/api/v1/login', ['phone' => '670000005', 'password' => 'password']);

        $wrongPhone->assertUnprocessable();
        $suspended->assertUnprocessable();
        $this->assertSame($wrongPhone->json('errors.phone.0'), $suspended->json('errors.phone.0'));
        $this->assertStringNotContainsString('suspendu', $suspended->json('errors.phone.0'));
    }

    /**
     * Brute-force guard regression: repeated failed login attempts for the
     * same phone number get rate-limited (429) instead of letting an
     * attacker keep guessing passwords indefinitely — see the 'login'
     * RateLimiter defined in AppServiceProvider.
     */
    public function test_repeated_failed_logins_are_rate_limited(): void
    {
        User::factory()->create(['phone' => '670000006', 'password' => Hash::make('password')]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/login', ['phone' => '670000006', 'password' => 'wrong'])
                ->assertUnprocessable();
        }

        $this->postJson('/api/v1/login', ['phone' => '670000006', 'password' => 'wrong'])
            ->assertStatus(429);

        // The correct password doesn't bypass the limiter either, once hit.
        $this->postJson('/api/v1/login', ['phone' => '670000006', 'password' => 'password'])
            ->assertStatus(429);
    }

    /**
     * Regression for config/sanctum.php's 'expiration' — tokens used to
     * never expire (null) at all. A token older than the configured
     * window must stop authenticating; one still within it keeps working.
     */
    public function test_a_token_older_than_the_configured_expiration_stops_authenticating(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        PersonalAccessToken::query()->update(['created_at' => now()->subDays(31)]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/me')
            ->assertUnauthorized();
    }

    public function test_a_token_within_the_configured_expiration_still_authenticates(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        PersonalAccessToken::query()->update(['created_at' => now()->subDays(29)]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/me')
            ->assertOk();
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/v1/logout');

        $response->assertNoContent();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_me_returns_the_authenticated_user(): void
    {
        $user = User::factory()->create(['name' => 'Jean Bosco']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/me');

        // A bare `return new UserResource(...)` (unlike register/login's
        // manually-built `['user' => new UserResource(...)]`) goes through
        // Laravel's default resource wrapping, hence "data.name" here.
        $response->assertOk()->assertJsonPath('data.name', 'Jean Bosco');
    }

    public function test_update_profile_changes_name_and_phone(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/v1/me', [
            'name' => 'Nouveau Nom',
            'phone' => '670000006',
        ]);

        $response->assertOk()->assertJsonPath('data.name', 'Nouveau Nom');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Nouveau Nom', 'phone' => '670000006']);
    }

    public function test_social_auth_creates_a_new_account_on_first_sign_in(): void
    {
        $this->mock(FirebaseIdTokenVerifier::class, function ($mock) {
            $mock->shouldReceive('verify')->once()->andReturn([
                'sub' => 'firebase-uid-123',
                'name' => 'Google User',
                'email' => 'google.user@example.com',
                'firebase' => ['sign_in_provider' => 'google.com'],
            ]);
        });

        $response = $this->postJson('/api/v1/auth/social', ['id_token' => 'fake-jwt']);

        // Pins a real bug found while writing this test: without
        // User::refresh() after create() in the controller, the freshly
        // created user's in-memory is_active was null (not mass-assignable,
        // never set explicitly) — the very next line's suspended-account
        // check then rejected every brand-new social sign-up.
        $response->assertCreated();
        $this->assertDatabaseHas('users', ['firebase_uid' => 'firebase-uid-123', 'email' => 'google.user@example.com']);
    }

    public function test_social_auth_reauthenticates_an_existing_firebase_account(): void
    {
        $existing = User::factory()->create(['firebase_uid' => 'firebase-uid-456']);

        $this->mock(FirebaseIdTokenVerifier::class, function ($mock) {
            $mock->shouldReceive('verify')->once()->andReturn([
                'sub' => 'firebase-uid-456',
                'firebase' => ['sign_in_provider' => 'google.com'],
            ]);
        });

        $response = $this->postJson('/api/v1/auth/social', ['id_token' => 'fake-jwt']);

        $response->assertOk()->assertJsonPath('user.id', $existing->id);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_social_auth_rejects_a_token_that_fails_verification(): void
    {
        $this->mock(FirebaseIdTokenVerifier::class, function ($mock) {
            $mock->shouldReceive('verify')->once()->andThrow(new \RuntimeException('ID token has expired.'));
        });

        $response = $this->postJson('/api/v1/auth/social', ['id_token' => 'expired-jwt']);

        $response->assertUnprocessable()->assertJsonValidationErrors('id_token');
    }

    public function test_forgot_password_sends_a_reset_link_when_a_recovery_email_is_on_file(): void
    {
        Notification::fake();
        $user = User::factory()->create(['phone' => '670000007', 'recovery_email' => 'awa@example.com']);

        $response = $this->postJson('/api/v1/forgot-password', ['phone' => '670000007']);

        $response->assertOk();
        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    /**
     * Same generic response — and no notification sent at all — whether the
     * phone doesn't exist or belongs to an account with no recovery email on
     * file. Telling those apart would let this endpoint be used to probe
     * which phone numbers have accounts (same reasoning as login() above).
     */
    public function test_forgot_password_does_not_reveal_whether_the_phone_exists_or_has_a_recovery_email(): void
    {
        Notification::fake();
        User::factory()->create(['phone' => '670000008', 'recovery_email' => null]);

        $unknownPhone = $this->postJson('/api/v1/forgot-password', ['phone' => '699999998']);
        $noRecoveryEmail = $this->postJson('/api/v1/forgot-password', ['phone' => '670000008']);

        $unknownPhone->assertOk();
        $noRecoveryEmail->assertOk();
        $this->assertSame($unknownPhone->json('message'), $noRecoveryEmail->json('message'));
        Notification::assertNothingSent();
    }

    public function test_reset_password_with_a_valid_token_changes_the_password_and_revokes_existing_sessions(): void
    {
        $user = User::factory()->create([
            'phone' => '670000009',
            'password' => Hash::make('old-password'),
            'recovery_email' => 'awa@example.com',
        ]);
        $existingToken = $user->createToken('test')->plainTextToken;
        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/v1/reset-password', [
            'phone' => '670000009',
            'token' => $token,
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response->assertOk();
        $this->assertTrue(Hash::check('new-password123', $user->fresh()->password));
        $this->withHeader('Authorization', "Bearer {$existingToken}")
            ->getJson('/api/v1/me')
            ->assertUnauthorized();
        $this->postJson('/api/v1/login', ['phone' => '670000009', 'password' => 'new-password123'])
            ->assertOk();
    }

    public function test_reset_password_rejects_an_invalid_token(): void
    {
        User::factory()->create(['phone' => '670000010', 'recovery_email' => 'awa@example.com']);

        $response = $this->postJson('/api/v1/reset-password', [
            'phone' => '670000010',
            'token' => 'not-a-real-token',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('token');
    }
}
