<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\User;
use Tests\TestCase;

class BannerLocationTest extends TestCase
{
    private function banner(string $location): Banner
    {
        return Banner::create([
            'title' => 'Bannière test',
            'image' => '/storage/banners/test.jpg',
            'link_type' => 'external',
            'location' => $location,
            'position' => 1,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
            'is_active' => true,
        ]);
    }

    public function test_the_public_endpoint_filters_ad_slot_banners_by_location(): void
    {
        $adSlotOne = $this->banner('homepage_ad_1');
        $adSlotTwo = $this->banner('homepage_ad_2');
        $mainHero = $this->banner('homepage');

        $response = $this->getJson('/api/v1/banners?location=homepage_ad_1')->assertOk();

        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($adSlotOne->id));
        $this->assertFalse($ids->contains($adSlotTwo->id));
        $this->assertFalse($ids->contains($mainHero->id));
    }

    public function test_an_admin_can_move_a_banner_into_an_ad_slot(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $banner = $this->banner('homepage');

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/banners/{$banner->id}", [
                'location' => 'homepage_ad_2',
                'title' => $banner->title,
                'link_type' => 'external',
                'link_url' => 'https://example.com',
                'starts_at' => now()->subDay()->toDateTimeString(),
                'ends_at' => now()->addDay()->toDateTimeString(),
            ])
            ->assertOk()
            ->assertJsonPath('data.location', 'homepage_ad_2');
    }

    public function test_an_invalid_location_is_still_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $banner = $this->banner('homepage');

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/banners/{$banner->id}", ['location' => 'sidebar_footer_nonsense'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('location');
    }
}
