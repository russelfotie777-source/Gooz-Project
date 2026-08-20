<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    protected $fillable = [
        'name',
        'support_email',
        'support_phone',
        'country',
    ];

    /**
     * There is only ever one row, created empty on first access so behavior
     * is defined even before an admin has filled in the company profile.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'name' => '',
            'support_email' => '',
            'support_phone' => '',
            'country' => '',
        ]);
    }
}
