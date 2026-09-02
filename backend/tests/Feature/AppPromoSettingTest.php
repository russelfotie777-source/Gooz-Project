<?php

namespace Tests\Feature;

use App\Models\AppPromoImage;
use App\Models\User;
use Tests\TestCase;

class AppPromoSettingTest extends TestCase
{
    public function test_the_public_endpoint_returns_the_master_switch_and_only_active_images_in_order(): void
    {
        AppPromoImage::create(['image' => 'https://example.test/2.jpg', 'is_active' => true, 'position' => 2]);
        AppPromoImage::create(['image' => 'https://example.test/1.jpg', 'is_active' => true, 'position' => 1]);
        AppPromoImage::create(['image' => 'https://example.test/hidden.jpg', 'is_active' => false, 'position' => 0]);

        $response = $this->getJson('/api/v1/app-promo');

        $response->assertOk();
        $response->assertJsonPath('data.is_active', true);
        $response->assertJsonPath('data.images', [
            ['id' => AppPromoImage::where('position', 1)->value('id'), 'image' => 'https://example.test/1.jpg', 'is_active' => true, 'position' => 1],
            ['id' => AppPromoImage::where('position', 2)->value('id'), 'image' => 'https://example.test/2.jpg', 'is_active' => true, 'position' => 2],
        ]);
    }

    public function test_the_public_endpoint_returns_an_empty_image_list_when_none_are_active(): void
    {
        $response = $this->getJson('/api/v1/app-promo');

        $response->assertOk();
        $response->assertJsonPath('data.images', []);
    }

    public function test_a_guest_cannot_access_the_admin_endpoint(): void
    {
        $this->getJson('/api/v1/admin/app-promo')->assertUnauthorized();
    }

    public function test_a_staff_member_without_the_permission_is_forbidden(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $this->actingAs($staff, 'sanctum')
            ->getJson('/api/v1/admin/app-promo')
            ->assertForbidden();
    }

    public function test_an_admin_can_toggle_the_widget_off(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson('/api/v1/admin/app-promo', ['is_active' => false]);

        $response->assertOk();
        $response->assertJsonPath('data.is_active', false);
        $this->assertDatabaseHas('app_promo_settings', ['is_active' => false]);
    }
}
