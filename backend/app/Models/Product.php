<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'base_price',
        'promo_price',
        'brand_id',
        'category_id',
        'reference',
        'is_active',
        'is_promotion',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'promo_price' => 'decimal:2',
            'is_active' => 'boolean',
            'is_promotion' => 'boolean',
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
