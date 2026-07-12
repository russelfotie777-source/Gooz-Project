<?php

namespace App\Http\Controllers;

use App\Http\Requests\Delivery\DeliveryQuoteRequest;
use App\Services\DeliveryFeeCalculator;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class DeliveryQuoteController extends Controller
{
    public function __construct(private readonly DeliveryFeeCalculator $calculator) {}

    public function store(DeliveryQuoteRequest $request): JsonResponse
    {
        $cart = $request->user()->carts()->where('is_active', true)->with('items')->first();
        $itemCount = $cart?->items->sum('quantity') ?? 0;

        try {
            $result = $this->calculator->calculate(
                $request->validated('latitude'),
                $request->validated('longitude'),
                $itemCount
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'delivery_fee' => $result['fee'],
            'distance_km' => $result['distance_km'],
            'warehouse' => [
                'id' => $result['warehouse']->id,
                'name' => $result['warehouse']->name,
            ],
        ]);
    }
}
