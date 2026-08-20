<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserNotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            // Only populated for the admin list, which eager-loads `user`
            // (see Admin\UserNotificationController::index) — the customer
            // endpoint never loads it, so these stay absent there.
            'user_name' => $this->whenLoaded('user', fn () => $this->user->name),
            'user_phone' => $this->whenLoaded('user', fn () => $this->user->phone),
            'title' => $this->title,
            'body' => $this->body,
            'type' => $this->type,
            'is_read' => $this->read_at !== null,
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
        ];
    }
}
