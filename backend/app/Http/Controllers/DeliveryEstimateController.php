<?php

namespace App\Http\Controllers;

use App\Http\Requests\Delivery\DeliveryEstimateRequest;
use App\Models\Neighborhood;
use App\Services\DeliveryFeeCalculator;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Public counterpart to DeliveryQuoteController: estimates the delivery fee
 * from a neighborhood's coordinates instead of the authenticated user's cart,
 * so product pages can show a price before an account/cart exists.
 */
class DeliveryEstimateController extends Controller
{
    public function __construct(private readonly DeliveryFeeCalculator $calculator) {}

    public function show(DeliveryEstimateRequest $request): JsonResponse
    {
        $neighborhood = Neighborhood::findOrFail($request->validated('neighborhood_id'));
        $itemCount = (int) $request->validated('item_count', 1);

        try {
            $result = $this->calculator->calculate(
                (float) $neighborhood->latitude,
                (float) $neighborhood->longitude,
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
