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
        Category::firstOrCreate(
            ['slug' => 'vetements'],
            ['name' => 'Vêtements']
        );
        Category::firstOrCreate(
            ['slug' => 'chaussures'],
            ['name' => 'Chaussures']
        );
        Category::firstOrCreate(
            ['slug' => 'sacs'],
            ['name' => 'Sacs']
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
