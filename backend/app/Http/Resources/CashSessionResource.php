<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'period' => $this->whenLoaded('period', fn () => [
                'id' => $this->period->id,
                'name' => $this->period->name,
            ]),
            'opener' => $this->whenLoaded('opener', fn () => $this->opener ? [
                'id' => $this->opener->id,
                'name' => $this->opener->name,
            ] : null),
            'closer' => $this->whenLoaded('closer', fn () => $this->closer ? [
                'id' => $this->closer->id,
                'name' => $this->closer->name,
            ] : null),
            'opening_cash' => $this->opening_cash,
            'closing_cash' => $this->closing_cash,
            'status' => $this->status,
            'opened_at' => $this->opened_at,
            'closed_at' => $this->closed_at,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
        ];
    }
}
