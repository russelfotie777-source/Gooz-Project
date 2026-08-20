<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'phone', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'status_changed_at' => 'datetime',
            'phone_verified_at' => 'datetime',
        ];
    }

    /**
     * True for every staff role that should reach the admin panel at all.
     * What each of those roles can actually *do* once inside is decided by
     * hasPermission() below.
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin', 'manager', 'staff', 'stagiaire'], true);
    }

    /**
     * admin/super_admin always pass — restricting them via the
     * role-permissions screen would risk locking every admin out at once.
     * Other staff roles (manager/staff/stagiaire) are checked against the
     * role_permissions table, defaulting to no access until granted.
     */
    public function hasPermission(string $permission): bool
    {
        if (in_array($this->role, ['admin', 'super_admin'], true)) {
            return true;
        }

        if (! $this->isAdmin()) {
            return false;
        }

        return RolePermission::where('role', $this->role)->where('permission', $permission)->exists();
    }

    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function deviceTokens(): HasMany
    {
        return $this->hasMany(DeviceToken::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(UserStatusHistory::class)->latest();
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class)->latest();
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class)->latest();
    }
}
