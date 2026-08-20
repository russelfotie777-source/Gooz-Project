<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserNotificationResource;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// Customer-facing in-app notification inbox ("Tout"/"Non lu" on mobile) —
// distinct from the Firebase push system (DeviceTokenController): this is
// the persisted, readable/dismissable list a device token push can't give
// you on its own (history, read state, works without notification
// permission granted).
class UserNotificationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $request->user()->userNotifications();

        if ($request->boolean('unread')) {
            $query->unread();
        }

        return UserNotificationResource::collection($query->get());
    }

    public function markRead(Request $request, UserNotification $notification): UserNotificationResource
    {
        abort_if($notification->user_id !== $request->user()->id, 403);

        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return new UserNotificationResource($notification);
    }

    public function markAllRead(Request $request)
    {
        $request->user()->userNotifications()->unread()->update(['read_at' => now()]);

        return response()->json(null, 204);
    }
}
