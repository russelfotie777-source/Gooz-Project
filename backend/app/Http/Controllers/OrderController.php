<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()->orders()
            ->with(['items.product.brand', 'items.variant', 'payment', 'warehouse'])
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders);
    }

    public function show(Request $request, Order $order): OrderResource
    {
        abort_if(
            $order->user_id !== $request->user()->id && ! $request->user()->isAdmin(),
            403
        );

        $order->load(['items.product.brand', 'items.variant', 'payment', 'warehouse']);

        return new OrderResource($order);
    }
}
