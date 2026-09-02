<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    /**
     * Every named permission gated behind Gate::define() in
     * AppServiceProvider. Kept as a single source of truth so the admin
     * endpoint can validate against it and Gate::define() can loop over it
     * instead of repeating one closure per permission.
     */
    public const ALL = [
        'manage-products',
        'manage-orders',
        'manage-deliveries',
        'moderate-reviews',
        'manage-users',
        'manage-coupons',
        'view-stats',
        'manage-warehouses',
        'manage-suppliers',
        'manage-stock-adjustments',
        'view-inventory-ledger',
        'manage-delivery-settings',
        'manage-cart-settings',
        'manage-neighborhoods',
        'manage-homepage-sections',
        'manage-accounting',
        'manage-company-profile',
        'manage-announcements',
        'manage-app-promo',
    ];

    /**
     * Roles whose access can be restricted through the role-permissions
     * screen. admin/super_admin always have full access (see
     * User::hasPermission()) so they're deliberately not configurable here
     * — that would risk an admin locking themselves out.
     */
    public const CONFIGURABLE_ROLES = ['manager', 'staff', 'stagiaire'];

    protected $fillable = [
        'role',
        'permission',
    ];
}
