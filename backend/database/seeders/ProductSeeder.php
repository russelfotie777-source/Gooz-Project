<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $warehouse = Warehouse::where('name', 'Entrepôt Akwa')->firstOrFail();
        $gooz = Brand::where('name', 'Gooz Original')->first();
        $doualaStyle = Brand::where('name', 'Douala Style')->first();
        $kmerFashion = Brand::where('name', 'Kmer Fashion')->first();
        $chaussures = Category::where('slug', 'chaussures')->first();
        $sacs = Category::where('slug', 'sacs')->first();
        $electronique = Category::where('slug', 'electronique')->first();
        $maison = Category::where('slug', 'maison-cuisine')->first();
        $vetements = Category::where('slug', 'vetements')->first();

        $products = [
            [
                'name' => 'Sneakers Classic',
                'reference' => 'SNK-001',
                'category_id' => $chaussures->id,
                'brand_id' => $gooz->id,
                'base_price' => 25000,
                'promo_price' => 20000,
                'is_promotion' => true,
                'description' => 'Baskets confortables pour un usage quotidien.',
                'variants' => [
                    ['size' => '40', 'additional_price' => 0],
                    ['size' => '41', 'additional_price' => 0],
                    ['size' => '42', 'additional_price' => 500],
                ],
                'stock' => 20,
            ],
            [
                'name' => 'Sac à dos Urbain',
                'reference' => 'SAC-001',
                'category_id' => $sacs->id,
                'brand_id' => $doualaStyle->id,
                'base_price' => 18000,
                'description' => 'Sac à dos résistant, idéal pour la ville.',
                'variants' => [],
                'stock' => 15,
            ],
            [
                'name' => 'Écouteurs Bluetooth',
                'reference' => 'ELEC-001',
                'category_id' => $electronique->id,
                'brand_id' => $kmerFashion->id,
                'base_price' => 15000,
                'description' => 'Écouteurs sans fil, autonomie 8h.',
                'variants' => [],
                'stock' => 30,
            ],
            [
                'name' => 'Théière Inox',
                'reference' => 'MAI-001',
                'category_id' => $maison->id,
                'brand_id' => $doualaStyle->id,
                'base_price' => 8000,
                'description' => 'Théière en acier inoxydable, 1.5L.',
                'variants' => [],
                'stock' => 25,
            ],
            [
                'name' => 'Chemise Wax',
                'reference' => 'VET-001',
                'category_id' => $vetements->id,
                'brand_id' => $kmerFashion->id,
                'base_price' => 12000,
                'promo_price' => 9000,
                'is_promotion' => true,
                'description' => 'Chemise en tissu wax, coupe moderne.',
                'variants' => [
                    ['color' => 'Bleu', 'additional_price' => 0],
                    ['color' => 'Rouge', 'additional_price' => 0],
                ],
                'stock' => 18,
            ],
            [
                'name' => 'Montre Connectée',
                'reference' => 'ELEC-002',
                'category_id' => $electronique->id,
                'brand_id' => $gooz->id,
                'base_price' => 35000,
                'description' => 'Montre connectée avec suivi santé.',
                'variants' => [],
                'stock' => 10,
            ],
        ];

        foreach ($products as $data) {
            $variants = $data['variants'];
            $stockQty = $data['stock'];
            unset($data['variants'], $data['stock']);

            $product = Product::firstOrCreate(['reference' => $data['reference']], $data);

            if (empty($variants)) {
                $product->stocks()->firstOrCreate([
                    'warehouse_id' => $warehouse->id,
                    'product_variant_id' => null,
                ], ['quantity_available' => $stockQty]);

                continue;
            }

            foreach ($variants as $variantData) {
                $variant = $product->variants()->firstOrCreate($variantData);

                $product->stocks()->firstOrCreate([
                    'warehouse_id' => $warehouse->id,
                    'product_variant_id' => $variant->id,
                ], ['quantity_available' => $stockQty]);
            }
        }
    }
}
