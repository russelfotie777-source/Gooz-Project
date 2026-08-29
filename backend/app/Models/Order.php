<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'coupon_id',
        'order_reference',
        'status',
        'total_amount',
        'discount_amount',
        'delivery_fees',
        'delivery_method',
        'warehouse_id',
        'shipping_address',
        'shipping_phone',
        'shipping_latitude',
        'shipping_longitude',
        'review_requested_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'delivery_fees' => 'decimal:2',
            'shipping_latitude' => 'decimal:7',
            'shipping_longitude' => 'decimal:7',
            'review_requested_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        // withTrashed: a soft-deleted (anonymized) account must still resolve
        // here so order history keeps showing "Utilisateur supprimé" instead
        // of a null user.
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class);
    }

    // order_reference is stable and is what the customer/frontend always
    // uses, but Enkap calls back (webhook + return URL) with whatever
    // merchantReference we last sent it — which diverges from
    // order_reference after a retry (Enkap rejects reusing the same value;
    // see EnkapPaymentService::createOrder()). Checking order_reference
    // first covers the common, never-retried case with a single indexed
    // lookup.
    public static function findByAnyReference(string $reference): ?self
    {
        return static::where('order_reference', $reference)->first()
            ?? Payment::where('merchant_reference', $reference)->first()?->order;
    }
}
