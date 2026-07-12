<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Warehouse::firstOrCreate(
            ['name' => 'Entrepôt Akwa'],
            [
                'region' => 'Littoral',
                'ville' => 'Douala',
                'quartier' => 'Akwa',
                'latitude' => 4.0483,
                'longitude' => 9.6987,
                'phone' => '699000002',
                'responsible_name' => 'Responsable Akwa',
            ]
        );
    }
}
