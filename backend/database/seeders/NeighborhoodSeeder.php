<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Neighborhood;
use Illuminate\Database\Seeder;

class NeighborhoodSeeder extends Seeder
{
    private const NEIGHBORHOODS = [
        'Douala' => [
            'Akwa' => [4.0483, 9.6987],
            'Bonamoussadi' => [4.0770, 9.7370],
            'Bonapriso' => [4.0270, 9.7050],
            'Bonanjo' => [4.0450, 9.6930],
        ],
        'Yaoundé' => [
            'Bastos' => [3.8895, 11.5171],
            'Mvog-Mbi' => [3.8520, 11.5210],
            'Nlongkak' => [3.8780, 11.5190],
            'Essos' => [3.8730, 11.5300],
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::NEIGHBORHOODS as $cityName => $neighborhoods) {
            $city = City::where('name', $cityName)->firstOrFail();

            foreach ($neighborhoods as $name => [$latitude, $longitude]) {
                Neighborhood::firstOrCreate(
                    ['city_id' => $city->id, 'name' => $name],
                    ['latitude' => $latitude, 'longitude' => $longitude]
                );
            }
        }
    }
}
