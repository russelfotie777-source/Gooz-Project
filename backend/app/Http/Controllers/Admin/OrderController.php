<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\PushNotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    // en_préparation/en_attente read fine with the underscore in code, not
    // in a sentence a customer reads — this is purely presentational.
    private const STATUS_LABELS = [
        'en_attente' => 'en attente',
        'confirmée' => 'confirmée',
        'en_préparation' => 'en préparation',
        'expédiée' => 'expédiée',
        'livrée' => 'livrée',
        'annulée' => 'annulée',
    ];

    public function __construct(private readonly PushNotificationService $pushNotifications) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->with(['user', 'items.product', 'payment', 'delivery', 'warehouse'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('user_id'), fn ($q, $userId) => $q->where('user_id', $userId))
            ->when($request->query('q'), fn ($q, $search) => $q->where(function ($query) use ($search) {
                $query->where('order_reference', 'like', "%{$search}%")
                    ->orWhere('shipping_phone', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"));
            }))
            ->latest()
            ->paginate(20);

        return OrderResource::collection($orders);
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load([
            'user', 'items.product', 'items.variant', 'payment', 'delivery.deliveryBoy', 'warehouse', 'coupon',
        ]));
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): OrderResource
    {
        $order->update(['status' => $request->validated('status')]);

        $title = 'Commande '.$order->order_reference;
        $body = 'Le statut de votre commande est désormais : '.(self::STATUS_LABELS[$order->status] ?? $order->status).'.';

        // Was push-only before — the in-app inbox (UserNotification) never
        // recorded these, so a shopper who missed/dismissed the push had no
        // way to see it again later.
        $order->user->userNotifications()->create(['title' => $title, 'body' => $body, 'type' => 'order_status']);
        $this->pushNotifications->sendToUser(
            $order->user,
            $title,
            $body,
            ['order_id' => $order->id, 'status' => $order->status]
        );

        return new OrderResource($order->fresh(['user', 'items.product', 'payment', 'delivery', 'warehouse']));
    }
}
