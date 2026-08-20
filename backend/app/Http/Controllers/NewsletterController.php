<?php

namespace App\Http\Controllers;

use App\Http\Requests\Newsletter\SubscribeNewsletterRequest;
use App\Models\NewsletterSubscriber;

class NewsletterController extends Controller
{
    public function subscribe(SubscribeNewsletterRequest $request)
    {
        $email = $request->validated('email');

        // Idempotent on purpose: submitting an already-subscribed email
        // shouldn't reveal that fact (or error) to whoever's typing it — it
        // also transparently re-activates a previously unsubscribed address.
        $subscriber = NewsletterSubscriber::firstOrCreate(['email' => $email]);

        if ($subscriber->unsubscribed_at) {
            $subscriber->update(['unsubscribed_at' => null]);
        }

        return response()->json(['message' => 'Subscribed.'], 201);
    }
}
