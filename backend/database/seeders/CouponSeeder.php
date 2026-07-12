<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Coupon::firstOrCreate(
            ['code' => 'BIENVENUE10'],
            [
                'type' => 'percentage',
                'value' => 10,
                'min_order_amount' => null,
                'max_uses' => null,
                'expires_at' => null,
                'is_active' => true,
            ]
        );
    }
}
