<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HomepageSection extends Model
{
    protected $fillable = [
        'internal_name',
        'display_title',
        'slug',
        'description',
        'section_type',
        'display_layout',
        'automatic_strategy',
        'display_mode',
        'sort_direction',
        'item_limit',
        'visibility',
        'view_all_url',
        'starts_at',
        'ends_at',
        'show_title',
        'show_view_all',
        'is_active',
        'position',
        'window_days',
        'category_ids',
        'brand_ids',
        'min_price',
        'max_price',
        'in_stock_only',
        'campaign_products_only',
    ];

    protected function casts(): array
    {
        return [
            'category_ids' => 'array',
            'brand_ids' => 'array',
            'min_price' => 'decimal:2',
            'max_price' => 'decimal:2',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'show_title' => 'boolean',
            'show_view_all' => 'boolean',
            'is_active' => 'boolean',
            'in_stock_only' => 'boolean',
            'campaign_products_only' => 'boolean',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(HomepageSectionItem::class)->orderBy('position');
    }
}
