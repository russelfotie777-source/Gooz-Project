<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartSetting extends Model
{
    protected $fillable = [
        'expires_after',
        'expires_unit',
    ];

    protected function casts(): array
    {
        return [
            'expires_after' => 'integer',
        ];
    }

    /**
     * There is only ever one row, created with sane defaults on first access
     * so behavior is defined even before an admin has visited the settings page.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'expires_after' => 4,
            'expires_unit' => 'jours',
        ]);
    }
}
