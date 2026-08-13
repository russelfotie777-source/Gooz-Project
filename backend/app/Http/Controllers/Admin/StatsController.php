<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    private const CANCELLED_STATUS = 'annulée';
    private const PENDING_STATUS = 'en_attente';
    private const LOW_STOCK_THRESHOLD = 5;

    public function overview(Request $request)
    {
        $paidOrders = Order::query()->where('status', '!=', self::CANCELLED_STATUS);

        $totalRevenue = (clone $paidOrders)->sum('total_amount');
        $totalOrders = (clone $paidOrders)->count();

        $ordersByStatus = Order::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $lowStock = Stock::query()
            ->with(['product:id,name', 'warehouse:id,name'])
            ->whereRaw('(quantity_available - quantity_reserved) <= ?', [self::LOW_STOCK_THRESHOLD])
            ->orderByRaw('(quantity_available - quantity_reserved) asc')
            ->limit(5)
            ->get()
            ->map(fn (Stock $stock) => [
                'product_name' => $stock->product?->name,
                'warehouse_name' => $stock->warehouse?->name,
                'quantity_available' => $stock->quantity_available - $stock->quantity_reserved,
            ]);

        return response()->json([
            'total_revenue' => round((float) $totalRevenue, 2),
            'total_orders' => $totalOrders,
            'average_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0,
            'orders_by_status' => $ordersByStatus,
            'pending_orders' => (clone $paidOrders)->where('status', self::PENDING_STATUS)->count(),
            'orders_today' => Order::query()->whereDate('created_at', now()->toDateString())->count(),
            'total_customers' => User::query()->where('role', 'customer')->count(),
            'low_stock' => $lowStock,
        ]);
    }

    public function revenue(Request $request)
    {
        $from = $request->query('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : now()->subDays(29)->startOfDay();

        $to = $request->query('to')
            ? Carbon::parse($request->query('to'))->endOfDay()
            : now()->endOfDay();

        $rows = Order::query()
            ->where('status', '!=', self::CANCELLED_STATUS)
            ->whereBetween('created_at', [$from, $to])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders_count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json(['data' => $rows]);
    }

    public function topProducts(Request $request)
    {
        $limit = min((int) $request->query('limit', 10), 50) ?: 10;

        $rows = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('orders.status', '!=', self::CANCELLED_STATUS)
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                DB::raw('SUM(order_items.quantity) as quantity_sold'),
                DB::raw('SUM(order_items.quantity * order_items.unit_price) as revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('quantity_sold')
            ->limit($limit)
            ->get();

        return response()->json(['data' => $rows]);
    }
}
