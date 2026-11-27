<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// Tells the Next.js frontend to drop its cached fetches for the given tags
// (see frontend/lib/api.ts's taggedCache() and frontend/app/api/revalidate/
// route.ts) right after an admin action changes something a shopper sees —
// a product's is_active toggle, a category/brand save, a banner update, etc.
//
// Exists because the frontend's own 60s ISR revalidate window turned out not
// to be reliable on its own on this (self-hosted, no CDN) deployment — a
// deactivated product kept showing on the homepage well past that window,
// and the only fix at the time was a full `npm run build`. This closes that
// gap without needing the admin to know anything happened.
//
// Queued (same reasoning as SendPushNotificationJob/ResetPasswordNotification):
// the admin's save request shouldn't block on a round-trip to the frontend
// server, and a transient frontend hiccup shouldn't turn into a 500 on the
// save itself. Best-effort — if it fails, the content is still correct in
// the database and will show up at worst after the next natural
// revalidation or deploy; this job's job is just to make that instant.
class RevalidateFrontendCache implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<int, string>  $tags
     */
    public function __construct(private readonly array $tags) {}

    public function handle(): void
    {
        $frontendUrl = config('services.revalidate.frontend_url');
        $secret = config('services.revalidate.secret');

        if (! $frontendUrl || ! $secret || $this->tags === []) {
            return;
        }

        try {
            $response = Http::withToken($secret)
                ->timeout(5)
                ->post(rtrim($frontendUrl, '/').'/api/revalidate', ['tags' => $this->tags]);

            if (! $response->successful()) {
                Log::warning('frontend_revalidate_failed', [
                    'tags' => $this->tags,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('frontend_revalidate_error', [
                'tags' => $this->tags,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
