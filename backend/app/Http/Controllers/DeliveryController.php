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
    // "en_transit" gets its own title ("Livreur en route") rather than the
    // generic "Livraison {ref}" the other statuses use — it's the one
    // moment in the delivery lifecycle worth calling out specifically.
    private const STATUS_MESSAGES = [
        'en_attente' => ['title' => 'Livraison', 'body' => 'Votre livraison est en attente de prise en charge par le livreur.'],
        'pris_en_charge' => ['title' => 'Livraison', 'body' => 'Votre livraison a été prise en charge par le livreur.'],
        'en_transit' => ['title' => 'Livreur en route', 'body' => 'Votre livreur est en route pour vous livrer votre commande.'],
        'livré' => ['title' => 'Livraison', 'body' => 'Votre livraison a été effectuée avec succès. Merci de votre confiance !'],
        'échec' => ['title' => 'Livraison', 'body' => 'La tentative de livraison a échoué, nous allons vous recontacter.'],
    ];

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

        $message = self::STATUS_MESSAGES[$delivery->delivery_status] ?? null;
        $title = trim(($message['title'] ?? 'Livraison').' '.$delivery->order->order_reference);
        $body = $message['body'] ?? "Votre livraison est maintenant : {$delivery->delivery_status}.";

        // Was push-only before — the in-app inbox (UserNotification) never
        // recorded these, so a shopper who missed/dismissed the push had no
        // way to see it again later.
        $delivery->order->user->userNotifications()->create(['title' => $title, 'body' => $body, 'type' => 'delivery_status']);
        $this->pushNotifications->sendToUser(
            $delivery->order->user,
            $title,
            $body,
            ['order_id' => $delivery->order_id, 'delivery_status' => $delivery->delivery_status]
        );

        return new DeliveryResource($delivery->load('deliveryBoy'));
    }
}
