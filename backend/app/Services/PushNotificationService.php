<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Throwable;

class PushNotificationService
{
    public function __construct(private readonly FirebaseMessaging $messaging) {}

    /**
     * Sends a push notification to every device registered for a user, and
     * prunes any device token FCM reports as stale (app uninstalled, token
     * rotated) so it isn't retried on the next notification.
     */
    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $deviceTokens = $user->deviceTokens()->get();

        if ($deviceTokens->isEmpty()) {
            return;
        }

        foreach ($deviceTokens as $deviceToken) {
            try {
                $result = $this->messaging->send($deviceToken->token, $title, $body, $data);
            } catch (Throwable $e) {
                Log::error('push_notification_failed', [
                    'user_id' => $user->id,
                    'device_token_id' => $deviceToken->id,
                    'error' => $e->getMessage(),
                ]);

                continue;
            }

            if ($result['invalidToken']) {
                $deviceToken->delete();
            }
        }
    }
}
