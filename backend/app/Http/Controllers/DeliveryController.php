<?php

namespace App\Http\Controllers;

use App\Http\Requests\Delivery\UpdateDeliveryStatusRequest;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use App\Services\PushNotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DeliveryController extends Controller
{
    public function __construct(private readonly PushNotificationService $pushNotifications) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $deliveries = Delivery::query()
            ->where('delivery_boy_id', $request->user()->id)
            ->with(['order.items.product', 'deliveryBoy'])
            ->latest()
            ->paginate(20);

        return DeliveryResource::collection($deliveries);
    }

    public function updateStatus(UpdateDeliveryStatusRequest $request, Delivery $delivery): DeliveryResource
    {
        abort_if(
            ! $request->user()->isAdmin() && $delivery->delivery_boy_id !== $request->user()->id,
            403
        );

        $status = $request->validated('delivery_status');

        $timelineColumn = match ($status) {
            'pris_en_charge' => 'shipped_at',
            'en_transit' => 'out_for_delivery_at',
            'livré' => 'delivered_at',
            'échec' => 'failed_at',
            default => null,
        };

        $attributes = ['delivery_status' => $status];
        if ($timelineColumn) {
            $attributes[$timelineColumn] = now();
        }

        $delivery->update($attributes);

        if ($delivery->delivery_status === 'livré') {
            $delivery->order->update(['status' => 'livrée']);
        }

        $delivery->loadMissing('order.user');
        $this->pushNotifications->sendToUser(
            $delivery->order->user,
            'Livraison '.$delivery->order->order_reference,
            "Votre livraison est maintenant : {$delivery->delivery_status}.",
            ['order_id' => $delivery->order_id, 'delivery_status' => $delivery->delivery_status]
        );

        return new DeliveryResource($delivery->load('deliveryBoy'));
    }
}
