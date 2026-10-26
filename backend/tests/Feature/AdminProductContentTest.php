<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Tests\TestCase;

/**
 * Regression for the product page's "Spécifications"/"Détails du
 * produit"/"Plus d'information" sections no longer being auto-recombined
 * from other fields — an admin can now set each one's content directly.
 */
class AdminProductContentTest extends TestCase
{
    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_set_specifications_details_and_more_info_on_create(): void
    {
        $admin = $this->admin();
        $category = Category::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/products', [
            'name' => 'Routeur WiFi 6',
            'category_ids' => [$category->id],
            'specifications' => [
                ['label' => 'Poids', 'value' => '350 g'],
                ['label' => 'Dimensions', 'value' => '18 x 12 x 4 cm'],
            ],
            'product_details' => 'Fabriqué pour un usage intensif en intérieur.',
            'more_info' => 'Garantie 2 ans, pièces disponibles localement.',
        ]);

        // 200, not 201: store() returns the product via ->fresh(), which
        // resets wasRecentlyCreated — Laravel's resource-response auto-
        // status only picks 201 off that flag (see ExpenseController's own
        // comment on the same pitfall elsewhere in this codebase).
        $response->assertOk();
        $response->assertJsonPath('data.specifications', [
            ['label' => 'Poids', 'value' => '350 g'],
            ['label' => 'Dimensions', 'value' => '18 x 12 x 4 cm'],
        ]);
        $response->assertJsonPath('data.product_details', 'Fabriqué pour un usage intensif en intérieur.');
        $response->assertJsonPath('data.more_info', 'Garantie 2 ans, pièces disponibles localement.');
    }

    public function test_a_product_created_without_them_exposes_empty_defaults(): void
    {
        $admin = $this->admin();
        $category = Category::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/products', [
            'name' => 'Produit simple',
            'category_ids' => [$category->id],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.specifications', []);
        $this->assertNull($response->json('data.product_details'));
        $this->assertNull($response->json('data.more_info'));
    }

    public function test_admin_can_update_and_clear_these_fields(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create();

        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/products/{$product->id}", [
            'specifications' => [['label' => 'Couleur', 'value' => 'Noir']],
            'product_details' => 'Texte mis à jour.',
            'more_info' => 'Info mise à jour.',
        ])->assertOk();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'product_details' => 'Texte mis à jour.',
            'more_info' => 'Info mise à jour.',
        ]);
        $this->assertSame(
            [['label' => 'Couleur', 'value' => 'Noir']],
            $product->fresh()->specifications
        );

        // Clearing back to empty must work too (not stuck once set).
        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/products/{$product->id}", [
            'specifications' => [],
            'product_details' => null,
            'more_info' => null,
        ])->assertOk();

        $product->refresh();
        $this->assertSame([], $product->specifications);
        $this->assertNull($product->product_details);
        $this->assertNull($product->more_info);
    }

    public function test_a_specification_row_requires_both_a_label_and_a_value(): void
    {
        $admin = $this->admin();
        $category = Category::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/products', [
            'name' => 'Produit incomplet',
            'category_ids' => [$category->id],
            'specifications' => [['label' => 'Poids']],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('specifications.0.value');
    }
}
