<?php

namespace App\Http\Controllers;

use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Resources\TicketResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// Customer-facing: a shopper opening/consulting their own support tickets.
// Distinct from Admin\TicketController, which lets staff create/manage
// tickets for any user — this one is scoped to $request->user() only and
// deliberately ignores `assigned_to` from the payload (staff-only concern).
class TicketController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $tickets = $request->user()->tickets()->with(['assignee', 'creator'])->latest()->get();

        return TicketResource::collection($tickets);
    }

    public function store(StoreTicketRequest $request): TicketResource
    {
        $ticket = $request->user()->tickets()->create([
            'subject' => $request->validated('subject'),
            'category' => $request->validated('category'),
            'priority' => $request->validated('priority'),
            'message' => $request->validated('message'),
            'status' => 'ouvert',
            'created_by' => $request->user()->id,
        ]);

        return new TicketResource($ticket->load(['assignee', 'creator']));
    }
}
