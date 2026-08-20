<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserNotification\StoreUserNotificationRequest;
use App\Http\Resources\UserNotificationResource;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\PushNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserNotificationController extends Controller
{
    public function __construct(private readonly PushNotificationService $pushNotifications) {}

    public function index(): AnonymousResourceCollection
    {
        $notifications = UserNotification::query()
            ->with('user:id,name,phone')
            ->latest()
            ->paginate(25);

        return UserNotificationResource::collection($notifications);
    }

    // Either targets one customer (user_id) or broadcasts to every active
    // customer (send_to_all) — see StoreUserNotificationRequest. send_push
    // additionally fires an FCM push via the existing PushNotificationService
    // (same one order/delivery events already use) so this doesn't need its
    // own separate push pipeline.
    public function store(StoreUserNotificationRequest $request): JsonResponse
    {
        $title = $request->validated('title');
        $body = $request->validated('body');
        $type = $request->validated('type');
        $sendPush = $request->boolean('send_push');

        if ($request->boolean('send_to_all')) {
            $sent = 0;

            User::query()
                ->where('role', 'customer')
                ->where('is_active', true)
                ->chunkById(200, function ($users) use ($title, $body, $type, $sendPush, &$sent) {
                    foreach ($users as $user) {
                        $user->userNotifications()->create(['title' => $title, 'body' => $body, 'type' => $type]);

                        if ($sendPush) {
                            $this->pushNotifications->sendToUser($user, $title, (string) $body);
                        }

                        $sent++;
                    }
                });

            return response()->json(['sent' => $sent], 201);
        }

        $user = User::findOrFail($request->validated('user_id'));

        $notification = $user->userNotifications()->create([
            'title' => $title,
            'body' => $body,
            'type' => $type,
        ]);

        if ($sendPush) {
            $this->pushNotifications->sendToUser($user, $title, (string) $body);
        }

        return (new UserNotificationResource($notification))->response()->setStatusCode(201);
    }
}
