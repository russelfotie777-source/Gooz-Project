<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Delivery\AssignDeliveryRequest;
use App\Http\Resources\DeliveryResource;
use App\Models\Order;
use App\Services\PushNotificationService;
use Illuminate\Support\Str;

class DeliveryController extends Controller
{
    public function __construct(private readonly PushNotificationService $pushNotifications) {}

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
