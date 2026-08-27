<?php

namespace App\Services\Enkap;

use App\Models\Order;
use App\Models\Payment;
use App\Services\PushNotificationService;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class EnkapPaymentService
{
    // Maps Enkap's provider-specific status vocabulary (from GET
    // /api/order/{txid}/status) onto the app's existing payment_status
    // enum (en_attente/payé/échoué/remboursé), so the rest of the app
    // (PaymentResource, frontend PaymentStatus type) never needs to learn
    // Enkap's status names — those stay visible only via provider_status.
    private const STATUS_MAP = [
        'CREATED' => 'en_attente',
        'INITIALISED' => 'en_attente',
        'QUEUED' => 'en_attente',
        'IN_PROGRESS' => 'en_attente',
        'CONFIRMED' => 'payé',
        'SUCCESS' => 'payé',
        'FAILED' => 'échoué',
        'CANCELED' => 'échoué',
    ];

    public function __construct(
        private readonly EnkapClient $client,
        private readonly PushNotificationService $pushNotifications,
    ) {}

    /**
     * Registers the order with Enkap and returns the checkout redirect URL
     * the customer must be sent to. Persists Enkap's transaction id and the
     * redirect URL on the Payment record.
     */
    public function createOrder(Order $order, Payment $payment): string
    {
        $response = $this->client->post('/api/order', [
            'merchantReference' => $order->order_reference,
            'description' => "Commande {$order->order_reference}",
            'totalAmount' => (float) $payment->amount,
            'currency' => 'XAF',
            'phoneNumber' => $order->shipping_phone,
            'langKey' => 'fr',
        ], [
            'x-dev-smobilpal-merchant' => config('services.enkap.merchant_username'),
        ]);

        if (! $response->successful()) {
            Log::error('enkap_order_creation_failed', [
                'order_id' => $order->id,
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            throw new RuntimeException('Unable to create the Enkap payment order.');
        }

        $data = $response->json();

        $payment->update([
            'transaction_reference' => $data['orderTransactionId'],
            'checkout_url' => $data['redirectUrl'],
            'provider_response' => $data,
        ]);

        return $data['redirectUrl'];
    }

    /**
     * Queries Enkap for the current authoritative status and applies it to
     * the payment (and, on a newly-confirmed payment, the order). Safe to
     * call repeatedly — from the webhook, the customer return page, or a
     * manual admin recheck. Deliberately re-verifies against this GET
     * endpoint rather than trusting the webhook's own body, since Maviance's
     * own notification payload formats are inconsistently documented across
     * providers (MTN vs generic) — this endpoint is the single source of truth.
     */
    public function refreshStatus(Payment $payment): string
    {
        $order = $payment->order;

        if (! $payment->transaction_reference) {
            return $payment->payment_status;
        }

        $response = $this->client->get('/api/order/status', [
            'txid' => $payment->transaction_reference,
        ]);

        if (! $response->successful()) {
            Log::warning('enkap_status_check_failed', [
                'payment_id' => $payment->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return $payment->payment_status;
        }

        // {"status": "CREATED"} — confirmed live against the real API
        // (the WSO2 devportal's swagger wrongly described this as a bare
        // JSON string response).
        $providerStatus = (string) $response->json('status');
        $mapped = self::STATUS_MAP[$providerStatus] ?? $payment->payment_status;
        $previousStatus = $payment->payment_status;

        $payment->update([
            'payment_status' => $mapped,
            'provider_status' => $providerStatus,
        ]);

        if ($mapped === 'payé' && $order->status === 'en_attente') {
            $order->update(['status' => 'confirmée']);

            if ($order->user && ! $order->user->trashed()) {
                $title = 'Commande '.$order->order_reference;
                $body = 'Votre paiement a été confirmé — votre commande est en cours de préparation.';

                $order->user->userNotifications()->create([
                    'title' => $title,
                    'body' => $body,
                    'type' => 'order_status',
                ]);
                $this->pushNotifications->sendToUser($order->user, $title, $body, [
                    'order_id' => $order->id,
                    'status' => 'confirmée',
                ]);
            }
        }

        // Only on the transition into "échoué", not every re-check — this
        // gets called repeatedly (webhook retries, the customer's return
        // page, a manual admin recheck), and an already-failed payment
        // re-checked later shouldn't notify the shopper a second time.
        if ($mapped === 'échoué' && $previousStatus !== 'échoué' && $order->user && ! $order->user->trashed()) {
            $title = 'Paiement échoué';
            $body = "Le paiement de votre commande {$order->order_reference} n'a pas abouti. Vous pouvez réessayer depuis votre espace commandes.";

            $order->user->userNotifications()->create([
                'title' => $title,
                'body' => $body,
                'type' => 'payment_failed',
            ]);
            $this->pushNotifications->sendToUser($order->user, $title, $body);
        }

        return $mapped;
    }
}
