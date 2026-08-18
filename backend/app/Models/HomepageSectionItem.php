<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomepageSectionItem extends Model
{
    protected $fillable = [
        'homepage_section_id',
        'product_id',
        'position',
    ];

    public function homepageSection(): BelongsTo
    {
        return $this->belongsTo(HomepageSection::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
