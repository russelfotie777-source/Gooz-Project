<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'customer_name' => $this->whenLoaded('user', fn () => $this->user->name),
            'customer_phone' => $this->whenLoaded('user', fn () => $this->user->phone),
            'subject' => $this->subject,
            'category' => $this->category,
            'priority' => $this->priority,
            'status' => $this->status,
            'message' => $this->message,
            'assigned_to_id' => $this->assigned_to,
            'assigned_to' => $this->assignee?->name,
            'created_by' => $this->creator?->name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
