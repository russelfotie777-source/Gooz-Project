<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Coupon\StoreCouponRequest;
use App\Http\Requests\Coupon\UpdateCouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $coupons = Coupon::query()
            ->when($request->query('q'), fn ($q, $search) => $q->where('code', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage);

        return CouponResource::collection($coupons);
    }

    public function show(Coupon $coupon): CouponResource
    {
        return new CouponResource($coupon);
    }

    public function store(StoreCouponRequest $request): CouponResource
    {
        $data = $request->validated();
        $data['code'] ??= $this->generateUniqueCode();

        $coupon = Coupon::create($data);

        return new CouponResource($coupon->fresh());
    }

    private function generateUniqueCode(): string
    {
        do {
            $code = 'PROMO'.strtoupper(Str::random(6));
        } while (Coupon::where('code', $code)->exists());

        return $code;
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
