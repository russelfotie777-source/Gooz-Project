<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('manage-products', fn (User $user) => $user->isAdmin());
        Gate::define('manage-orders', fn (User $user) => $user->isAdmin());
        Gate::define('manage-deliveries', fn (User $user) => $user->isAdmin());
        Gate::define('moderate-reviews', fn (User $user) => $user->isAdmin());
        Gate::define('manage-users', fn (User $user) => $user->isAdmin());
        Gate::define('manage-coupons', fn (User $user) => $user->isAdmin());
        Gate::define('view-stats', fn (User $user) => $user->isAdmin());
        Gate::define('manage-warehouses', fn (User $user) => $user->isAdmin());
        Gate::define('manage-suppliers', fn (User $user) => $user->isAdmin());
        Gate::define('manage-stock-adjustments', fn (User $user) => $user->isAdmin());
        Gate::define('view-inventory-ledger', fn (User $user) => $user->isAdmin());
    }
}
