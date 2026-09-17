<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'phone_verified_at' => $this->phone_verified_at,
            'email' => $this->email,
            'role' => $this->role,
            'permissions' => $this->when($this->isAdmin(), fn () => $this->allPermissions()),
            'is_active' => $this->is_active,
            'status' => $this->status,
            'status_reason' => $this->status_reason,
            'status_changed_at' => $this->status_changed_at,
            'created_at' => $this->created_at,
            'orders_count' => $this->whenCounted('orders'),
            'tickets_count' => $this->whenCounted('tickets'),
            'addresses_count' => $this->when(isset($this->addresses_count), $this->addresses_count),
            'status_histories' => UserStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
            'tickets' => TicketResource::collection($this->whenLoaded('tickets')),
        ];
    }
}
