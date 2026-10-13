"use client";

import { useEffect, useState } from "react";
import { getProduct } from "@/lib/api";
import { getRecentlyViewedIds } from "@/lib/productView";
import ProductSection from "@/components/ProductSection/ProductSection";
import type { Product } from "@/lib/types";

interface RecentlyViewedSectionProps {
  /** Never show the product the shopper is currently looking at among its
   *  own "recently viewed" list. */
  excludeProductId: number;
}

// Purely client-side (localStorage, this browser's own history) — starts
// empty on every render including the first client one, same as the server
// render, so there's nothing to hydrate-mismatch on; the real list only
// shows up after the mount effect below resolves.
export default function RecentlyViewedSection({ excludeProductId }: RecentlyViewedSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const ids = getRecentlyViewedIds(excludeProductId);
    if (ids.length === 0) return;

    let cancelled = false;
    Promise.allSettled(ids.map((id) => getProduct(id))).then((results) => {
      if (cancelled) return;
      const found = results
        .filter((r): r is PromiseFulfilledResult<Product> => r.status === "fulfilled")
        .map((r) => r.value);
      setProducts(found);
    });

    return () => {
      cancelled = true;
    };
  }, [excludeProductId]);

  if (products.length === 0) return null;

  return <ProductSection titleKey="recentlyViewedTitle" products={products} cardLayout="column" />;
}
