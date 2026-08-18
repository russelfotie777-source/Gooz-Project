<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Delivery\AssignDeliveryRequest;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use App\Models\Order;
use App\Services\PushNotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class DeliveryController extends Controller
{
    public function __construct(private readonly PushNotificationService $pushNotifications) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $deliveries = Delivery::query()
            ->with(['deliveryBoy', 'order.user', 'order.payment'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('delivery_status', $status))
            ->when($request->query('q'), fn ($q, $search) => $q->whereHas(
                'order',
                fn ($o) => $o->where('order_reference', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
            ))
            ->latest()
            ->paginate(20);

        return DeliveryResource::collection($deliveries);
    }

    public function store(AssignDeliveryRequest $request, Order $order): DeliveryResource
    {
        $delivery = $order->delivery()->updateOrCreate([], [
            'delivery_boy_id' => $request->validated('delivery_boy_id'),
            'delivery_status' => 'en_attente',
            'tracking_code' => 'TRK-'.strtoupper(Str::random(8)),
        ]);

        $delivery->load('deliveryBoy');

        $this->pushNotifications->sendToUser(
            $delivery->deliveryBoy,
            'Nouvelle livraison assignée',
            "La commande {$order->order_reference} vous a été assignée.",
            ['order_id' => $order->id, 'delivery_id' => $delivery->id]
        );

        return new DeliveryResource($delivery);
    }
}
