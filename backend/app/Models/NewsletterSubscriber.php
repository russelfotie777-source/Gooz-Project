<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'email',
        'unsubscribed_at',
    ];

    protected function casts(): array
    {
        return [
            'unsubscribed_at' => 'datetime',
        ];
    }
}
