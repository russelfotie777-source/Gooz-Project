<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\FirebaseIdTokenVerifier;
use Illuminate\Support\Facades\Hash;
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

    public function test_login_rejects_a_suspended_account(): void
    {
        User::factory()->suspended()->create(['phone' => '670000005', 'password' => Hash::make('password')]);

        $response = $this->postJson('/api/v1/login', ['phone' => '670000005', 'password' => 'password']);

        $response->assertUnprocessable();
        $this->assertStringContainsString('suspendu', $response->json('errors.phone.0'));
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
}
