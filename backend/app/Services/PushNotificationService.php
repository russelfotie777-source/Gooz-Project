<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    /**
     * Sends a push notification to every device registered for a user.
     *
     * No FCM/OneSignal credentials are configured yet, so this currently
     * only logs the attempt. Once a provider is set up, replace the body
     * of this method with the actual HTTP call — every call site in the
     * app already passes the right title/body/data, so nothing else needs
     * to change.
     */
    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = $user->deviceTokens()->pluck('token');

        if ($tokens->isEmpty()) {
            return;
        }

        Log::info('push_notification', [
            'user_id' => $user->id,
            'tokens' => $tokens->all(),
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);
    }
}
