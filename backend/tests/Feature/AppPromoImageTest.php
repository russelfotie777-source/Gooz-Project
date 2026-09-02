<?php

namespace Tests\Feature;

use App\Models\AppPromoImage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class AppPromoImageTest extends TestCase
{
    public function test_a_guest_cannot_manage_images(): void
    {
        $this->getJson('/api/v1/admin/app-promo/images')->assertUnauthorized();
    }

    public function test_a_staff_member_without_the_permission_is_forbidden(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $this->actingAs($staff, 'sanctum')
            ->postJson('/api/v1/admin/app-promo/images', [])
            ->assertForbidden();
    }

    public function test_an_admin_can_upload_a_new_image_which_is_appended_after_the_existing_ones(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        AppPromoImage::create(['image' => 'https://example.test/first.jpg', 'is_active' => true, 'position' => 1]);
        $file = UploadedFile::fake()->image('promo.jpg', 400, 400);

        $response = $this->actingAs($admin, 'sanctum')
            ->post('/api/v1/admin/app-promo/images', ['image' => $file]);

        $response->assertCreated();
        $response->assertJsonPath('data.position', 2);
        $response->assertJsonPath('data.is_active', true);

        $created = AppPromoImage::where('position', 2)->firstOrFail();
        Storage::disk('public')->assertExists(Str::after($created->image, '/storage/'));
    }

    public function test_an_admin_can_list_every_image_regardless_of_active_state(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        AppPromoImage::create(['image' => 'https://example.test/on.jpg', 'is_active' => true, 'position' => 1]);
        AppPromoImage::create(['image' => 'https://example.test/off.jpg', 'is_active' => false, 'position' => 2]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/app-promo/images');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_an_admin_can_toggle_an_image_off_and_on(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $image = AppPromoImage::create(['image' => 'https://example.test/on.jpg', 'is_active' => true, 'position' => 1]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/app-promo/images/{$image->id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('app_promo_images', ['id' => $image->id, 'is_active' => false]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/app-promo/images/{$image->id}", ['is_active' => true])
            ->assertOk()
            ->assertJsonPath('data.is_active', true);
    }

    public function test_a_disabled_image_is_excluded_from_the_public_endpoint(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $image = AppPromoImage::create(['image' => 'https://example.test/on.jpg', 'is_active' => true, 'position' => 1]);

        $this->getJson('/api/v1/app-promo')->assertJsonCount(1, 'data.images');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/app-promo/images/{$image->id}", ['is_active' => false]);

        $this->getJson('/api/v1/app-promo')->assertJsonCount(0, 'data.images');
    }

    public function test_an_admin_can_delete_an_image_and_its_file(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        Storage::disk('public')->put('app-promo/gone.jpg', 'fake-content');
        $image = AppPromoImage::create([
            'image' => Storage::disk('public')->url('app-promo/gone.jpg'),
            'is_active' => true,
            'position' => 1,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/app-promo/images/{$image->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('app_promo_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing('app-promo/gone.jpg');
    }
}
