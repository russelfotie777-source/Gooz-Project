<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Douala', 'Yaoundé'] as $name) {
            City::firstOrCreate(['name' => $name]);
        }
    }
}
