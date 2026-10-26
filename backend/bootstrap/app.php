<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
        ]);
    })
    // Requires the server's own cron to run `php artisan schedule:run` every
    // minute (see Laravel's deployment docs) — nothing in this repo does
    // that on its own.
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('notifications:cart-reminders')->hourly();
        $schedule->command('notifications:review-requests')->daily();
        // Sanctum only REFUSES an expired token at auth time (see
        // config/sanctum.php's 'expiration') — it never deletes the row on
        // its own, so personal_access_tokens would otherwise grow forever.
        $schedule->command('sanctum:prune-expired --hours=24')->daily();

        // See config/backup.php for what's actually backed up (the
        // database + storage/app/public, not the codebase — that's
        // already in git) and where it's stored. clean → run → monitor,
        // in that order, each given enough room to finish before the next
        // starts: old archives are pruned first so cleanup isn't racing
        // disk space against the backup that just landed, and the health
        // check runs last so it's reporting on the archive this same
        // night actually produced.
        $schedule->command('backup:clean')->daily()->at('01:00');
        $schedule->command('backup:run')->daily()->at('01:30');
        $schedule->command('backup:monitor')->daily()->at('02:30');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
