<?php

namespace App\Http\Controllers;

use App\Http\Requests\Coupon\ValidateCouponRequest;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class CouponController extends Controller
{
    /**
     * Lets the frontend show a real discount preview (cart page, checkout
     * payment step) before the customer commits to an order — reuses the
     * exact same Coupon::isValidFor()/calculateDiscount() logic
     * CheckoutController applies at order time, so the preview can never
     * promise a discount the actual checkout wouldn't also grant.
     */
    public function validateCode(ValidateCouponRequest $request): JsonResponse
    {
        $subtotal = (float) $request->validated('subtotal');
        $coupon = Coupon::query()->where('code', strtoupper($request->validated('code')))->first();

        if (! $coupon || ! $coupon->isValidFor($subtotal)) {
            throw ValidationException::withMessages([
                'code' => ['Ce code promo est invalide ou n\'est plus utilisable.'],
            ]);
        }

        return response()->json([
            'code' => $coupon->code,
            'discount_amount' => $coupon->calculateDiscount($subtotal),
        ]);
    }
}
