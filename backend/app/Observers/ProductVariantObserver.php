<?php

namespace App\Observers;

use App\Models\Favorite;
use App\Models\ProductVariant;
use App\Services\PushNotificationService;

// Keeps products.min_price (denormalized for sorting/filtering — see the
// add_min_price_to_products_table migration) in sync whenever a variant's
// price changes, is added, or removed. Matches the scope of the subquery
// this replaced: MIN(base_price) across ALL variants of the product,
// regardless of is_active. Also watches for genuine price drops to notify
// shoppers who favorited the product.
class ProductVariantObserver
{
    public function __construct(private readonly PushNotificationService $pushNotifications) {}

    public function saved(ProductVariant $variant): void
    {
        $this->recalculate($variant);
        $this->notifyFavoritersOfPriceDrop($variant);
    }

    public function deleted(ProductVariant $variant): void
    {
        $this->recalculate($variant);
    }

    private function recalculate(ProductVariant $variant): void
    {
        // min('base_price') naturally returns null once the last variant is
        // gone — update() is then a harmless no-op if the product itself was
        // already deleted too (cascade delete).
        $variant->product()->update([
            'min_price' => ProductVariant::where('product_id', $variant->product_id)->min('base_price'),
        ]);
    }

    // A "price drop" is measured on the product's overall starting price (the
    // lowest effective price across all its variants, promotions included —
    // the same figure ProductResource shows shoppers as "price_from"), not on
    // this single variant in isolation: a cut to a variant that was never the
    // cheapest wouldn't change what a shopper actually sees.
    private function notifyFavoritersOfPriceDrop(ProductVariant $variant): void
    {
        if ($variant->wasRecentlyCreated) {
            return;
        }

        if (! ($variant->wasChanged('base_price') || $variant->wasChanged('promo_price') || $variant->wasChanged('is_promotion'))) {
            return;
        }

        $otherPrices = ProductVariant::where('product_id', $variant->product_id)
            ->where('id', '!=', $variant->id)
            ->get()
            ->map(fn (ProductVariant $other) => $other->effectivePrice());

        $oldPrice = $this->effectivePriceUsing(
            (bool) $variant->getOriginal('is_promotion'),
            $variant->getOriginal('promo_price'),
            $variant->getOriginal('base_price'),
        );
        $newPrice = $variant->effectivePrice();

        $oldMin = $otherPrices->concat([$oldPrice])->min();
        $newMin = $otherPrices->concat([$newPrice])->min();

        if ($newMin >= $oldMin) {
            return;
        }

        $favorites = Favorite::where('product_id', $variant->product_id)->with('user.deviceTokens')->get();

        if ($favorites->isEmpty()) {
            return;
        }

        $product = $variant->product;
        $title = 'Baisse de prix !';
        $body = "Le prix de \"{$product->name}\" a baissé, il est maintenant à ".number_format($newMin, 0, ',', ' ').' FCFA.';

        foreach ($favorites as $favorite) {
            if (! $favorite->user || $favorite->user->trashed()) {
                continue;
            }

            $favorite->update(['last_seen_price' => $newMin]);

            $favorite->user->userNotifications()->create([
                'title' => $title,
                'body' => $body,
                'type' => 'price_drop',
            ]);
            $this->pushNotifications->sendToUser($favorite->user, $title, $body, [
                'product_id' => $product->id,
                'price' => $newMin,
            ]);
        }
    }

    private function effectivePriceUsing(bool $isPromotion, mixed $promoPrice, mixed $basePrice): float
    {
        return (float) ($isPromotion && $promoPrice ? $promoPrice : $basePrice);
    }
}
