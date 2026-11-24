"use client";

import { useEffect, useState } from "react";
import { getProduct, getProducts } from "@/lib/api";
import { topCategoryIds } from "@/lib/homeSelection";
import { getRecentlyViewedIds } from "@/lib/productView";
import ProductSection from "@/components/ProductSection/ProductSection";
import type { Product } from "@/lib/types";

interface RecommendedSectionProps {
  /** Shown to first-time visitors, and until personal picks are ready. */
  fallback: Product[];
  viewAllHref?: string;
}

const MIN_PERSONAL = 4;
const MAX_ITEMS = 12;

// "Recommandé pour vous": products from the categories this shopper looked
// at most recently (localStorage history, see lib/productView), minus what
// they already saw. With no history — or not enough matches — it keeps the
// server-provided fallback, so the row is never empty or flashing.
export default function RecommendedSection({ fallback, viewAllHref }: RecommendedSectionProps) {
  const [products, setProducts] = useState(fallback);

  useEffect(() => {
    // -1: nothing to exclude, unlike the product page's own call.
    const viewedIds = getRecentlyViewedIds(-1, 6);
    if (viewedIds.length === 0) return;

    let cancelled = false;

    (async () => {
      const viewed = (await Promise.allSettled(viewedIds.map((id) => getProduct(id))))
        .filter((r): r is PromiseFulfilledResult<Product> => r.status === "fulfilled")
        .map((r) => r.value);

      const categoryIds = topCategoryIds(viewed);
      if (categoryIds.length === 0) return;

      const seen = new Set(viewedIds);
      const picks = (await getProducts({ category_id: categoryIds, per_page: MAX_ITEMS + seen.size }))
        .filter((p) => !seen.has(p.id))
        .slice(0, MAX_ITEMS);

      if (!cancelled && picks.length >= MIN_PERSONAL) setProducts(picks);
    })().catch(() => {
      // Best-effort personalization — the fallback row stays.
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (products.length === 0) return null;

  return <ProductSection
      titleKey="recommendedForYouTitle"
      products={products}
      cardLayout="market"
      viewAllHref={viewAllHref}
    />;
}
