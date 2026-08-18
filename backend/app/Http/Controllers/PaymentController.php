<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Enkap\EnkapPaymentService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class PaymentController extends Controller
{
    public function __construct(private readonly EnkapPaymentService $enkapPayments) {}

    /**
     * Single entry point for both cases the frontend needs after a mobile
     * money checkout: the customer returning from Enkap's payment page
     * (re-check the authoritative status), and a checkout whose initial
     * Enkap order creation failed (no transaction_reference yet — retry it).
     */
    public function refresh(Request $request, Order $order): OrderResource
    {
        abort_if($order->user_id !== $request->user()->id && ! $request->user()->isAdmin(), 403);

        $order->load('payment');
        $payment = $order->payment;

        if (! $payment || $payment->payment_method !== 'mobile_money') {
            throw ValidationException::withMessages([
                'payment' => ['Cette commande ne fait pas l\'objet d\'un paiement en ligne.'],
            ]);
        }

        try {
            if (! $payment->transaction_reference) {
                $this->enkapPayments->createOrder($order, $payment);
            } else {
                $this->enkapPayments->refreshStatus($payment);
            }
        } catch (RuntimeException $e) {
            throw ValidationException::withMessages([
                'payment' => [$e->getMessage()],
            ]);
        }

        return new OrderResource($order->load(['items.product.brand', 'items.variant', 'payment', 'warehouse']));
    }
}
