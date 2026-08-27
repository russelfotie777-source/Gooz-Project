<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\PushNotificationService;
use Illuminate\Console\Command;

class SendReviewRequests extends Command
{
    protected $signature = 'notifications:review-requests';

    protected $description = 'Asks shoppers to review the products from an order a few days after it was delivered.';

    // Asking right at the delivery moment is too early — the shopper hasn't
    // had a chance to actually use what they bought yet.
    private const DELAY_DAYS = 3;

    public function handle(PushNotificationService $pushNotifications): int
    {
        $sent = 0;

        Order::query()
            ->where('status', 'livrée')
            ->whereNull('review_requested_at')
            ->with(['user.deviceTokens', 'delivery'])
            ->chunkById(200, function ($orders) use ($pushNotifications, &$sent) {
                foreach ($orders as $order) {
                    // Pickup ("retrait") orders never get a Delivery row at
                    // all — order.updated_at (when an admin flipped the
                    // status to "livrée") is the next best signal for those.
                    $deliveredAt = $order->delivery?->delivered_at ?? $order->updated_at;

                    if ($deliveredAt->diffInDays(now()) < self::DELAY_DAYS) {
                        continue;
                    }

                    if (! $order->user || $order->user->trashed() || $order->user->deviceTokens->isEmpty()) {
                        // Deliberately not marked as requested — leaves the
                        // door open to ask once a device token eventually
                        // shows up, same reasoning as SendCartReminders.
                        continue;
                    }

                    $title = 'Votre avis compte !';
                    $body = "Comment s'est passée votre commande {$order->order_reference} ? Partagez votre avis sur les produits reçus.";

                    $order->user->userNotifications()->create([
                        'title' => $title,
                        'body' => $body,
                        'type' => 'review_request',
                    ]);
                    $pushNotifications->sendToUser($order->user, $title, $body, ['order_id' => $order->id]);

                    $order->update(['review_requested_at' => now()]);
                    $sent++;
                }
            });

        $this->info("Sent {$sent} review request(s).");

        return self::SUCCESS;
    }
}
