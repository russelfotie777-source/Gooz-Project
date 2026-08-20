<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MoneyMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'account' => $this->whenLoaded('account', fn () => [
                'id' => $this->account->id,
                'name' => $this->account->name,
            ]),
            'cash_session' => $this->whenLoaded('cashSession', fn () => $this->cashSession ? [
                'id' => $this->cashSession->id,
            ] : null),
            'direction' => $this->direction,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'channel' => $this->channel,
            'is_locked' => $this->is_locked,
            'creator' => $this->whenLoaded('creator', fn () => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ] : null),
            'created_at' => $this->created_at,
        ];
    }
}
