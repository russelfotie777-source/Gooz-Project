<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vetements = Category::firstOrCreate(
            ['slug' => 'vetements'],
            ['name' => 'Vêtements']
        );
        Category::firstOrCreate(
            ['slug' => 'chaussures'],
            ['name' => 'Chaussures', 'parent_id' => $vetements->id]
        );
        Category::firstOrCreate(
            ['slug' => 'sacs'],
            ['name' => 'Sacs', 'parent_id' => $vetements->id]
        );

        Category::firstOrCreate(
            ['slug' => 'electronique'],
            ['name' => 'Électronique']
        );

        Category::firstOrCreate(
            ['slug' => 'maison-cuisine'],
            ['name' => 'Maison & Cuisine']
        );
    }
}
