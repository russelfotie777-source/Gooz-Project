<?php

namespace App\Providers;

use App\Models\ProductVariant;
use App\Models\RolePermission;
use App\Models\User;
use App\Observers\ProductVariantObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
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
        foreach (RolePermission::ALL as $permission) {
            Gate::define($permission, fn (User $user) => $user->hasPermission($permission));
        }

        ProductVariant::observe(ProductVariantObserver::class);

        // Keyed by phone+IP, not just IP: a blanket per-IP limit would let
        // one attacker lock out every other customer behind the same NAT/
        // office network, while keying by phone alone would let an
        // attacker rotate IPs to keep hammering one account. Credential
        // stuffing against a single phone number is the actual threat this
        // guards against — see routes/api.php's `throttle:login`.
        RateLimiter::for('login', function (Request $request) {
            $phone = (string) $request->input('phone');

            return Limit::perMinute(5)->by($phone.'|'.$request->ip());
        });

        // Spam/abuse prevention on account creation — looser than login
        // (this isn't guarding a secret, just discouraging mass signups
        // from one source) and per-IP only, since there's no existing
        // account identifier to key on yet.
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}
