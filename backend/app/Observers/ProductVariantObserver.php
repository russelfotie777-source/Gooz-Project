<?php

namespace App\Observers;

use App\Models\ProductVariant;

// Keeps products.min_price (denormalized for sorting/filtering — see the
// add_min_price_to_products_table migration) in sync whenever a variant's
// price changes, is added, or removed. Matches the scope of the subquery
// this replaced: MIN(base_price) across ALL variants of the product,
// regardless of is_active.
class ProductVariantObserver
{
    public function saved(ProductVariant $variant): void
    {
        $this->recalculate($variant);
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
}
