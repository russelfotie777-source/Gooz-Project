<?php

namespace App\Console\Commands;

use App\Models\Cart;
use App\Services\PushNotificationService;
use Illuminate\Console\Command;

class SendCartReminders extends Command
{
    protected $signature = 'notifications:cart-reminders';

    protected $description = 'Reminds shoppers who left items sitting in an untouched cart to come back and check out.';

    /**
     * Staged, not a single one-off — "de temps en temps" per the feature
     * request, not a single nag. after_hours is measured from the cart's
     * last real activity (see CartItem::$touches) for stage 1, and from the
     * previous reminder for every stage after that — so stage 2 fires 24h
     * after stage 1 actually went out, not 24h after the cart went idle.
     * Capped here at 2 stages; a cart that's had both is left alone for
     * good rather than nagging forever.
     */
    private const STAGES = [
        1 => [
            'after_hours' => 4,
            'title' => 'Vous avez oublié quelque chose ?',
            'body' => 'Les articles de votre panier vous attendent — finalisez votre commande avant qu\'ils ne soient plus disponibles.',
        ],
        2 => [
            'after_hours' => 24,
            'title' => 'Votre panier vous attend toujours',
            'body' => 'Vos articles sont toujours réservés dans votre panier Shopitech. Passez commande dès maintenant.',
        ],
    ];

    public function handle(PushNotificationService $pushNotifications): int
    {
        $maxStage = count(self::STAGES);
        $sent = 0;

        Cart::query()
            ->where('is_active', true)
            ->where('reminder_count', '<', $maxStage)
            ->whereHas('items')
            ->with('user.deviceTokens')
            ->chunkById(200, function ($carts) use ($pushNotifications, &$sent) {
                foreach ($carts as $cart) {
                    if (! $cart->user || $cart->user->trashed() || $cart->user->deviceTokens->isEmpty()) {
                        continue;
                    }

                    $nextStage = $cart->reminder_count + 1;
                    $stage = self::STAGES[$nextStage];
                    $since = $cart->last_reminder_at ?? $cart->updated_at;

                    if ($since->diffInHours(now()) < $stage['after_hours']) {
                        continue;
                    }

                    $cart->user->userNotifications()->create([
                        'title' => $stage['title'],
                        'body' => $stage['body'],
                        'type' => 'cart_reminder',
                    ]);
                    $pushNotifications->sendToUser($cart->user, $stage['title'], $stage['body']);

                    $cart->update([
                        'reminder_count' => $nextStage,
                        'last_reminder_at' => now(),
                    ]);

                    $sent++;
                }
            });

        $this->info("Sent {$sent} cart reminder(s).");

        return self::SUCCESS;
    }
}
