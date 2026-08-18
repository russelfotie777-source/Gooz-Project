<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => $this->amount,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'transaction_reference' => $this->transaction_reference,
            // Enkap's hosted checkout page — only set for online (mobile
            // money) payments; the frontend redirects here right after
            // checkout when present.
            'checkout_url' => $this->checkout_url,
        ];
    }
}
