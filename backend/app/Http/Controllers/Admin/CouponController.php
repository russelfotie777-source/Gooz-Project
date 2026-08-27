<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Coupon\StoreCouponRequest;
use App\Http\Requests\Coupon\UpdateCouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Models\User;
use App\Services\PushNotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    public function __construct(private readonly PushNotificationService $pushNotifications) {}

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

        if ($coupon->is_active) {
            $this->broadcastNewCoupon($coupon);
        }

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
        $wasActive = $coupon->is_active;

        $coupon->update($request->validated());

        // Only the false -> true transition, not every edit to an
        // already-active coupon (that would re-broadcast on every unrelated
        // tweak — a typo fix to the description, say).
        if (! $wasActive && $coupon->is_active) {
            $this->broadcastNewCoupon($coupon);
        }

        return new CouponResource($coupon->fresh());
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return response()->json(null, 204);
    }

    // Coupons are codes anyone can use, not targeted at one shopper — so
    // unlike the other notification hooks in this app, this one broadcasts
    // to every active customer, the same chunked pattern
    // Admin\UserNotificationController::store already uses for send_to_all.
    private function broadcastNewCoupon(Coupon $coupon): void
    {
        $title = 'Nouveau code promo disponible !';
        $body = $this->couponMessage($coupon);

        User::query()
            ->where('role', 'customer')
            ->where('is_active', true)
            ->chunkById(200, function ($users) use ($title, $body, $coupon) {
                foreach ($users as $user) {
                    $user->userNotifications()->create(['title' => $title, 'body' => $body, 'type' => 'new_coupon']);
                    $this->pushNotifications->sendToUser($user, $title, $body, ['coupon_code' => $coupon->code]);
                }
            });
    }

    private function couponMessage(Coupon $coupon): string
    {
        $discount = $coupon->type === 'percentage'
            ? "{$coupon->value}%"
            : number_format((float) $coupon->value, 0, ',', ' ').' FCFA';

        return "Utilisez le code {$coupon->code} pour bénéficier de {$discount} de réduction sur votre prochaine commande.";
    }
}
