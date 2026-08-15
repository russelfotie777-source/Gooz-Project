<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends Model
{
    protected $fillable = [
        'name',
        'type',
        'code',
        'region',
        'pays',
        'ville',
        'quartier',
        'latitude',
        'longitude',
        'phone',
        'responsible_name',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_active' => 'boolean',
        ];
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }
}
