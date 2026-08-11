<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            CategorySeeder::class,
            BrandSeeder::class,
            WarehouseSeeder::class,
            CitySeeder::class,
            NeighborhoodSeeder::class,
            ProductSeeder::class,
            CouponSeeder::class,
        ]);

        User::firstOrCreate(
            ['phone' => '699000000'],
            ['name' => 'Test User', 'password' => Hash::make('Password123!')]
        );
    }
}
