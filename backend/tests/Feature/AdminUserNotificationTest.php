<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class AdminUserNotificationTest extends TestCase
{
    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_send_a_notification_to_one_user(): void
    {
        $admin = $this->admin();
        $user = User::factory()->create();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/notifications', [
            'title' => 'Promo du jour',
            'body' => 'Profitez de -10% aujourd\'hui.',
            'user_id' => $user->id,
        ])->assertCreated();

        $this->assertDatabaseCount('user_notifications', 1);
    }

    /**
     * Idempotency regression: double-submitting the exact same "send"
     * request (double-click before the button disables) must not send the
     * notification twice.
     */
    public function test_double_submitted_notification_is_sent_only_once(): void
    {
        $admin = $this->admin();
        $user = User::factory()->create();

        $payload = [
            'title' => 'Maintenance prévue',
            'body' => 'Le site sera indisponible ce soir.',
            'user_id' => $user->id,
        ];

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/notifications', $payload)
            ->assertCreated();

        $retry = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/notifications', $payload);
        $retry->assertUnprocessable()->assertJsonValidationErrors('duplicate');

        $this->assertDatabaseCount('user_notifications', 1);
    }

    public function test_double_submitted_broadcast_to_all_is_sent_only_once(): void
    {
        $admin = $this->admin();
        User::factory()->count(3)->create(['role' => 'customer', 'is_active' => true]);

        $payload = [
            'title' => 'Nouvelle collection',
            'body' => 'Découvrez nos nouveaux produits.',
            'send_to_all' => true,
        ];

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/notifications', $payload)
            ->assertCreated();

        $retry = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/notifications', $payload);
        $retry->assertUnprocessable()->assertJsonValidationErrors('duplicate');

        $this->assertDatabaseCount('user_notifications', 3);
    }
}
