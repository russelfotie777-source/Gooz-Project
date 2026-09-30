<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomepageAdSetting extends Model
{
    protected $fillable = [
        'flash_sacrifice_product_id',
        'mystery_box_product_id',
    ];

    public function flashSacrificeProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'flash_sacrifice_product_id');
    }

    public function mysteryBoxProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'mystery_box_product_id');
    }

    /**
     * There is only ever one row — created empty (no product picked) on
     * first access so behavior is defined even before an admin has visited
     * the settings page.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([], []);
    }
}
