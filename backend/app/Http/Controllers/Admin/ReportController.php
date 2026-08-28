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
}
