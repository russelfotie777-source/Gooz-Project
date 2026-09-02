<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppPromoImage extends Model
{
    protected $fillable = [
        'image',
        'is_active',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }
}
