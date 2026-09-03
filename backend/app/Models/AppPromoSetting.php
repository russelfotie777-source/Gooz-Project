<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppPromoSetting extends Model
{
    // Master on/off switch only — the widget's rotating images live in
    // AppPromoImage, each individually toggleable (see that model).
    protected $fillable = [
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'is_active' => true,
        ]);
    }
}
