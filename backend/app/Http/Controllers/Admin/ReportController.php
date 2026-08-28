<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    private const CANCELLED_STATUS = 'annulée';

    private const GROUP_EXPRESSIONS = [
        'day' => "DATE(created_at)",
        'week' => "DATE_FORMAT(created_at, '%x-S%v')",
        'month' => "DATE_FORMAT(created_at, '%Y-%m')",
    ];

    // total_amount is already net of discount_amount (see CheckoutController:
    // total = subtotal - discount + deliveryFee), so gross sales is
    // reconstructed by adding the discount back.
    public function dailySummary(Request $request)
    {
        $from = $request->query('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : now()->subDays(29)->startOfDay();

        $to = $request->query('to')
            ? Carbon::parse($request->query('to'))->endOfDay()
            : now()->endOfDay();

        $groupBy = $request->query('group_by', 'day');
        $periodExpr = self::GROUP_EXPRESSIONS[$groupBy] ?? self::GROUP_EXPRESSIONS['day'];

        $perPage = min((int) $request->query('per_page', 10), 1000) ?: 10;

        $paginator = Order::query()
            ->where('status', '!=', self::CANCELLED_STATUS)
            ->whereBetween('created_at', [$from, $to])
            ->select(
                DB::raw("{$periodExpr} as period"),
                DB::raw('COUNT(*) as orders_count'),
                DB::raw('SUM(total_amount + discount_amount) as gross_sales'),
                DB::raw('SUM(discount_amount) as discounts'),
                DB::raw('SUM(total_amount) as net_sales')
            )
            ->groupBy('period')
            ->orderByDesc('period')
            ->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function sales(Request $request)
    {
        $from = $request->query('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : now()->subDays(29)->startOfDay();

        $to = $request->query('to')
            ? Carbon::parse($request->query('to'))->endOfDay()
            : now()->endOfDay();

        $status = $request->query('status');
        $search = $request->query('q');
        $perPage = min((int) $request->query('per_page', 10), 1000) ?: 10;

        $paginator = Order::query()
            ->with('user')
            ->whereBetween('created_at', [$from, $to])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, fn ($q) => $q->where(function ($query) use ($search) {
                $query->where('order_reference', 'like', "%{$search}%")
                    ->orWhere('shipping_phone', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"));
            }))
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'data' => collect($paginator->items())->map(fn (Order $order) => [
                'order_reference' => $order->order_reference,
                'client_name' => $order->user?->name ?? '—',
                'total_amount' => $order->total_amount,
                'status' => $order->status,
                'created_at' => $order->created_at,
            ]),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function ordersSummary(Request $request)
    {
        $from = $request->query('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : now()->subDays(29)->startOfDay();

        $to = $request->query('to')
            ? Carbon::parse($request->query('to'))->endOfDay()
            : now()->endOfDay();

        $status = $request->query('status');
        $paymentStatus = $request->query('payment_status');
        $search = $request->query('q');
        $perPage = min((int) $request->query('per_page', 10), 1000) ?: 10;

        $paginator = Order::query()
            ->with(['user', 'payment'])
            ->whereBetween('created_at', [$from, $to])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($paymentStatus, fn ($q) => $q->whereHas(
                'payment',
                fn ($p) => $p->where('payment_status', $paymentStatus)
            ))
            ->when($search, fn ($q) => $q->where(function ($query) use ($search) {
                $query->where('order_reference', 'like', "%{$search}%")
                    ->orWhere('shipping_phone', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"));
            }))
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'data' => collect($paginator->items())->map(fn (Order $order) => [
                'order_reference' => $order->order_reference,
                'created_at' => $order->created_at,
                'client_name' => $order->user?->name ?? '—',
                'status' => $order->status,
                'payment_status' => $order->payment?->payment_status ?? 'en_attente',
                'total_amount' => $order->total_amount,
            ]),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
