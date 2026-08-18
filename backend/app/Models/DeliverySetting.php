<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliverySetting extends Model
{
    protected $fillable = [
        'base_fee',
        'free_radius_km',
        'price_per_km',
        'free_item_count',
        'price_per_extra_item',
        'min_fee',
        'max_fee',
    ];

    protected function casts(): array
    {
        return [
            'base_fee' => 'float',
            'free_radius_km' => 'float',
            'price_per_km' => 'float',
            'free_item_count' => 'integer',
            'price_per_extra_item' => 'float',
            'min_fee' => 'float',
            'max_fee' => 'float',
        ];
    }

    /**
     * There is only ever one row. Seeded from config/delivery.php (itself
     * .env-driven) on first access, so behavior is unchanged until an admin
     * actually edits a value through the UI.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'base_fee' => config('delivery.base_fee'),
            'free_radius_km' => config('delivery.free_radius_km'),
            'price_per_km' => config('delivery.price_per_km'),
            'free_item_count' => config('delivery.free_item_count'),
            'price_per_extra_item' => config('delivery.price_per_extra_item'),
            'min_fee' => config('delivery.min_fee'),
            'max_fee' => config('delivery.max_fee'),
        ]);
    }
}
