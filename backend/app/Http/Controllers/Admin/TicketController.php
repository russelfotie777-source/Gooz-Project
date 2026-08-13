<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketAssigneeRequest;
use App\Http\Requests\Ticket\UpdateTicketStatusRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $tickets = Ticket::query()
            ->with(['user:id,name,phone', 'assignee:id,name', 'creator:id,name'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('priority'), fn ($q, $priority) => $q->where('priority', $priority))
            ->when($request->query('category'), fn ($q, $category) => $q->where('category', $category))
            ->when($request->query('assigned_to'), fn ($q, $assignedTo) => $q->where('assigned_to', $assignedTo))
            ->when($request->query('user_id'), fn ($q, $userId) => $q->where('user_id', $userId))
            ->when($request->query('q'), fn ($q, $search) => $q->where(function ($query) use ($search) {
                $query->where('subject', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"));
            }))
            ->latest()
            ->paginate(20);

        return TicketResource::collection($tickets);
    }

    public function show(Ticket $ticket): TicketResource
    {
        return new TicketResource($ticket->load(['user:id,name,phone', 'assignee:id,name', 'creator:id,name']));
    }

    public function store(StoreTicketRequest $request, User $user): TicketResource
    {
        $ticket = $user->tickets()->create([
            ...$request->validated(),
            'status' => 'ouvert',
            'created_by' => $request->user()->id,
        ]);

        return new TicketResource($ticket->load(['assignee', 'creator']));
    }

    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket): TicketResource
    {
        $ticket->update(['status' => $request->validated('status')]);

        return new TicketResource($ticket->fresh(['user', 'assignee', 'creator']));
    }

    public function assign(UpdateTicketAssigneeRequest $request, Ticket $ticket): TicketResource
    {
        $ticket->update(['assigned_to' => $request->validated('assigned_to')]);

        return new TicketResource($ticket->fresh(['user', 'assignee', 'creator']));
    }
}
