<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Coupon\StoreCouponRequest;
use App\Http\Requests\Coupon\UpdateCouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CouponController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CouponResource::collection(Coupon::query()->latest()->paginate(20));
    }

    public function store(StoreCouponRequest $request): CouponResource
    {
        $coupon = Coupon::create($request->validated());

        return new CouponResource($coupon->fresh());
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon): CouponResource
    {
        $coupon->update($request->validated());

        return new CouponResource($coupon->fresh());
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return response()->json(null, 204);
    }
}
