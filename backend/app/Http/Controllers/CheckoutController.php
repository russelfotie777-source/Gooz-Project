<?php

namespace App\Http\Controllers;

use App\Http\Requests\Order\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Stock;
use App\Services\DeliveryFeeCalculator;
use App\Services\PushNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly PushNotificationService $pushNotifications,
        private readonly DeliveryFeeCalculator $deliveryFeeCalculator,
    ) {}

    public function store(CheckoutRequest $request): OrderResource
    {
        $cart = $request->user()->carts()
            ->where('is_active', true)
            ->with('items.product', 'items.variant')
            ->first();

        if (! $cart || $cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Votre panier est vide.'],
            ]);
        }

        $order = DB::transaction(function () use ($cart, $request) {
            $subtotal = 0;
            $lines = [];

            foreach ($cart->items as $item) {
                if (! $item->variant) {
                    throw ValidationException::withMessages([
                        'cart' => ["Veuillez sélectionner une variante pour {$item->product->name}."],
                    ]);
                }

                $this->decrementStock($item->product_id, $item->product_variant_id, $item->quantity);

                $unitPrice = $item->variant->effectivePrice();

                $subtotal += $unitPrice * $item->quantity;

                $lines[] = [
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                ];
            }

            [$coupon, $discount] = $this->applyCoupon($request->validated('coupon_code'), $subtotal);

            $itemCount = $cart->items->sum('quantity');
            [$deliveryFee, $warehouseId] = $this->resolveDelivery($request, $itemCount);

            $total = $subtotal - $discount + $deliveryFee;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'coupon_id' => $coupon?->id,
                'order_reference' => 'ORD-'.now()->format('ymd').'-'.strtoupper(Str::random(6)),
                'status' => 'en_attente',
                'total_amount' => $total,
                'discount_amount' => $discount,
                'delivery_method' => $request->validated('delivery_method'),
                'warehouse_id' => $warehouseId,
                'delivery_fees' => $deliveryFee,
                'shipping_address' => $request->validated('shipping_address'),
                'shipping_phone' => $request->validated('shipping_phone'),
                'shipping_latitude' => $request->validated('shipping_latitude'),
                'shipping_longitude' => $request->validated('shipping_longitude'),
            ]);

            $order->items()->createMany($lines);

            $order->payment()->create([
                'amount' => $total,
                'payment_method' => $request->validated('payment_method'),
                'payment_status' => 'en_attente',
            ]);

            $cart->update(['is_active' => false]);

            return $order;
        });

        $this->pushNotifications->sendToUser(
            $request->user(),
            'Commande reçue',
            "Votre commande {$order->order_reference} a bien été enregistrée.",
            ['order_id' => $order->id]
        );

        return new OrderResource($order->load(['items.product.brand', 'items.variant', 'payment', 'coupon', 'warehouse']));
    }

    /**
     * @return array{0: float, 1: ?int} [delivery_fee, warehouse_id]
     */
    private function resolveDelivery(CheckoutRequest $request, int $itemCount): array
    {
        if ($request->validated('delivery_method') === 'retrait') {
            return [0, (int) $request->validated('warehouse_id')];
        }

        try {
            $result = $this->deliveryFeeCalculator->calculate(
                (float) $request->validated('shipping_latitude'),
                (float) $request->validated('shipping_longitude'),
                $itemCount
            );
        } catch (RuntimeException $e) {
            throw ValidationException::withMessages([
                'shipping_latitude' => [$e->getMessage()],
            ]);
        }

        return [$result['fee'], $result['warehouse']->id];
    }

    /**
     * @return array{0: ?Coupon, 1: float}
     */
    private function applyCoupon(?string $code, float $subtotal): array
    {
        if (! $code) {
            return [null, 0];
        }

        $coupon = Coupon::query()->where('code', strtoupper($code))->lockForUpdate()->first();

        if (! $coupon || ! $coupon->isValidFor($subtotal)) {
            throw ValidationException::withMessages([
                'coupon_code' => ['Ce code promo est invalide ou n\'est plus utilisable.'],
            ]);
        }

        $discount = $coupon->calculateDiscount($subtotal);

        $coupon->increment('used_count');

        return [$coupon, $discount];
    }

    private function decrementStock(int $productId, ?int $variantId, int $quantity): void
    {
        $stocks = Stock::query()
            ->where('product_id', $productId)
            ->when(
                $variantId,
                fn ($q) => $q->where('product_variant_id', $variantId),
                fn ($q) => $q->whereNull('product_variant_id')
            )
            ->lockForUpdate()
            ->orderByDesc('quantity_available')
            ->get();

        $remaining = $quantity;

        foreach ($stocks as $stock) {
            if ($remaining <= 0) {
                break;
            }

            $take = min($stock->quantity_available - $stock->quantity_reserved, $remaining);

            if ($take > 0) {
                $stock->decrement('quantity_available', $take);
                $remaining -= $take;
            }
        }

        if ($remaining > 0) {
            throw ValidationException::withMessages([
                'stock' => ['Stock insuffisant pour un des articles du panier.'],
            ]);
        }
    }
}
