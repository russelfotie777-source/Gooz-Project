<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\PushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendPushNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $userId,
        private readonly string $title,
        private readonly string $body,
        private readonly array $data = [],
    ) {}

    public function handle(PushNotificationService $pushNotifications): void
    {
        $user = User::find($this->userId);

        if (! $user) {
            return;
        }

        $pushNotifications->sendToUser($user, $this->title, $this->body, $this->data);
    }
}
