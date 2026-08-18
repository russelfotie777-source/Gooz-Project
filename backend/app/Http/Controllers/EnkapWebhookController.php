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
     * whenever a payment's status changes. The body is deliberately
     * ignored — we re-verify via GET /api/order/{txid}/status instead; see
     * the comment on EnkapPaymentService::refreshStatus for why.
     */
    public function handle(Request $request, string $orderReference): Response
    {
        $order = Order::where('order_reference', $orderReference)->with('payment')->first();

        if (! $order || ! $order->payment) {
            Log::warning('enkap_webhook_unknown_order', ['order_reference' => $orderReference]);

            return response()->noContent(404);
        }

        $this->enkapPayments->refreshStatus($order->payment);

        return response()->noContent();
    }
}
