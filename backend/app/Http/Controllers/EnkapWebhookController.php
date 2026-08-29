<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\Enkap\EnkapPaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class EnkapWebhookController extends Controller
{
    public function __construct(private readonly EnkapPaymentService $enkapPayments) {}

    /**
     * Enkap PUTs {"status": "..."} to <notificationUrl>/{merchantReference}
     * whenever a payment's status changes — echoing back whichever
     * merchantReference *we* sent when creating that specific Enkap order,
     * which is only ever order_reference on the first attempt (see
     * Order::findByAnyReference()). The body is deliberately ignored — we
     * re-verify via GET /api/order/{txid}/status instead; see the comment
     * on EnkapPaymentService::refreshStatus for why.
     *
     * Enkap has no HMAC/signature header to verify the CALLER either, so
     * ?token=... is the substitute — a long random value only we and
     * Maviance's merchant portal (where the notification URL is registered)
     * know. Checked before even looking the order up, so a request without
     * it can't be used to probe which order references exist.
     */
    public function handle(Request $request, string $orderReference): Response
    {
        $expectedToken = config('services.enkap.webhook_token');

        if (! $expectedToken || ! hash_equals($expectedToken, (string) $request->query('token'))) {
            return response()->noContent(403);
        }

        $order = Order::findByAnyReference($orderReference)?->loadMissing('payment');

        if (! $order || ! $order->payment) {
            Log::warning('enkap_webhook_unknown_order', ['order_reference' => $orderReference]);

            return response()->noContent(404);
        }

        $this->enkapPayments->refreshStatus($order->payment);

        return response()->noContent();
    }
}
