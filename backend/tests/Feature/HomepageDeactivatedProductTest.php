<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\HomepageAdSetting;
use App\Models\HomepageSection;
use App\Models\HomepageSectionItem;
use App\Models\Product;
use Tests\TestCase;

class HomepageDeactivatedProductTest extends TestCase
{
    public function test_manual_homepage_section_hides_deactivated_product(): void
    {
        $visible = Product::factory()->create();
        $hidden = Product::factory()->inactive()->create();

        $section = HomepageSection::create([
            'internal_name' => 'Test manuel',
            'display_title' => 'Test manuel',
            'slug' => 'test-manuel',
            'section_type' => 'manual',
            'display_layout' => 'horizontal_list',
            'is_active' => true,
            'position' => 1,
        ]);

        HomepageSectionItem::create(['homepage_section_id' => $section->id, 'product_id' => $visible->id, 'position' => 1]);
        HomepageSectionItem::create(['homepage_section_id' => $section->id, 'product_id' => $hidden->id, 'position' => 2]);

        $response = $this->getJson('/api/v1/homepage-sections')->assertOk();

        $products = collect($response->json('data.0.products'))->pluck('id');
        $this->assertTrue($products->contains($visible->id));
        $this->assertFalse($products->contains($hidden->id));
    }

    public function test_homepage_ads_hide_deactivated_flash_and_mystery_products(): void
    {
        $flash = Product::factory()->inactive()->create();
        $mystery = Product::factory()->inactive()->create();

        HomepageAdSetting::current()->update([
            'flash_sacrifice_product_id' => $flash->id,
            'mystery_box_product_id' => $mystery->id,
        ]);

        $response = $this->getJson('/api/v1/homepage-ads')->assertOk();

        $this->assertNull($response->json('data.flash_sacrifice_product'));
        $this->assertNull($response->json('data.mystery_box_product'));
    }

    public function test_banner_hides_link_to_deactivated_product(): void
    {
        $product = Product::factory()->inactive()->create();

        Banner::create([
            'title' => 'Bannière test',
            'image' => 'banners/test.jpg',
            'location' => 'homepage',
            'link_type' => 'product',
            'product_id' => $product->id,
            'is_active' => true,
            'position' => 1,
        ]);

        $response = $this->getJson('/api/v1/banners')->assertOk();

        $this->assertNull($response->json('data.0.product'));
    }
}
