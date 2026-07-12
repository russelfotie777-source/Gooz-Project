<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Gooz Original', 'Douala Style', 'Kmer Fashion'] as $name) {
            Brand::firstOrCreate(['name' => $name], ['country_origin' => 'Cameroun']);
        }
    }
}
