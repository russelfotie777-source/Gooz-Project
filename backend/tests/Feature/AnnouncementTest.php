<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\RolePermission;
use App\Models\User;
use Tests\TestCase;

class AnnouncementTest extends TestCase
{
    public function test_public_listing_only_returns_active_in_window_announcements_ordered_by_position(): void
    {
        $second = Announcement::factory()->create(['text' => 'Second', 'position' => 2]);
        $first = Announcement::factory()->create(['text' => 'First', 'position' => 1]);
        Announcement::factory()->create(['text' => 'Inactive', 'is_active' => false]);
        Announcement::factory()->create(['text' => 'Not started yet', 'starts_at' => now()->addDay()]);
        Announcement::factory()->create(['text' => 'Already ended', 'ends_at' => now()->subDay()]);

        $response = $this->getJson('/api/v1/announcements');

        $response->assertOk();
        $this->assertSame([$first->id, $second->id], collect($response->json('data'))->pluck('id')->all());
    }

    public function test_admin_can_create_an_announcement(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/announcements', [
            'text' => 'Livraison gratuite dès 50 000 XAF',
            'icon' => '🚚',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.text', 'Livraison gratuite dès 50 000 XAF');
        $response->assertJsonPath('data.is_active', true);
        $response->assertJsonPath('data.position', 1);
    }

    public function test_creating_an_announcement_auto_increments_position_after_existing_ones(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Announcement::factory()->create(['position' => 5]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/announcements', [
            'text' => 'Nouveau message',
        ]);

        $response->assertOk()->assertJsonPath('data.position', 6);
    }

    public function test_admin_can_update_and_deactivate_an_announcement(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $announcement = Announcement::factory()->create(['text' => 'Old text', 'is_active' => true]);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/v1/admin/announcements/{$announcement->id}", [
            'text' => 'New text',
            'is_active' => false,
        ]);

        $response->assertOk()->assertJsonPath('data.text', 'New text')->assertJsonPath('data.is_active', false);
    }

    public function test_admin_can_delete_an_announcement(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $announcement = Announcement::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/announcements/{$announcement->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('announcements', ['id' => $announcement->id]);
    }

    public function test_staff_role_without_the_permission_is_forbidden(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $this->actingAs($staff, 'sanctum')
            ->postJson('/api/v1/admin/announcements', ['text' => 'Nope'])
            ->assertForbidden();
    }

    public function test_staff_role_granted_the_permission_can_manage_announcements(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        RolePermission::create(['role' => 'staff', 'permission' => 'manage-announcements']);

        $this->actingAs($staff, 'sanctum')
            ->postJson('/api/v1/admin/announcements', ['text' => 'Allowed now'])
            ->assertOk();
    }

    public function test_a_guest_cannot_reach_the_admin_endpoint(): void
    {
        $this->postJson('/api/v1/admin/announcements', ['text' => 'Nope'])->assertUnauthorized();
    }

    public function test_text_is_required(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/announcements', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('text');
    }
}
