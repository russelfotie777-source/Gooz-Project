"use client";

import { useEffect, useState } from "react";
import CategoryResults from "@/components/CategoryResults/CategoryResults";
import { getProduct, getProductsPage, type GetProductsParams, type ProductsPage } from "@/lib/api";
import { topCategoryIds } from "@/lib/homeSelection";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { getRecentlyViewedIds } from "@/lib/productView";
import type { Product } from "@/lib/types";
import styles from "./CollectionPage.module.css";

interface PersonalCollectionProps {
  title: string;
  description: string;
  /** New arrivals, server-rendered — shown with no browsing history. */
  fallbackProducts: Product[];
  fallbackLastPage: number;
  fallbackTotal: number;
  pageSize: number;
}

const NEW_ARRIVALS: GetProductsParams = { sort_by: "created_at", sort_dir: "desc" };

// "/collections/pour-vous": the full version of the homepage's
// "Recommandé pour vous" — products from the categories this browser viewed
// most (localStorage history), paginated. Until that's computed, or with no
// history at all, it shows new arrivals with a short explanation.
export default function PersonalCollection({
  title,
  description,
  fallbackProducts,
  fallbackLastPage,
  fallbackTotal,
  pageSize,
}: PersonalCollectionProps) {
  const dict = useDictionary();
  const [personal, setPersonal] = useState<{ params: GetProductsParams; first: ProductsPage } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const viewedIds = getRecentlyViewedIds(-1, 6);
    let cancelled = false;

    (async () => {
      if (viewedIds.length === 0) return;
      const viewed = (await Promise.allSettled(viewedIds.map((id) => getProduct(id))))
        .filter((r): r is PromiseFulfilledResult<Product> => r.status === "fulfilled")
        .map((r) => r.value);
      const categoryIds = topCategoryIds(viewed);
      if (categoryIds.length === 0) return;

      const params: GetProductsParams = { category_id: categoryIds, sort_by: "created_at", sort_dir: "desc" };
      const first = await getProductsPage({ ...params, per_page: pageSize, page: 1 });
      if (!cancelled && first.products.length > 0) setPersonal({ params, first });
    })()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pageSize]);

  if (personal) {
    return (
      <CategoryResults
        key="personal"
        mode="collection"
        resultsTitle={title}
        description={description}
        baseParams={personal.params}
        initialProducts={personal.first.products}
        initialLastPage={personal.first.lastPage}
        initialTotal={personal.first.total}
        initialPage={1}
        pageSize={pageSize}
        cardLayout="market"
      />
    );
  }

  return (
    <>
      {checked && <p className={styles.notice}>{dict.collections.pourVous.noHistory}</p>}
      <CategoryResults
        key="fallback"
        mode="collection"
        resultsTitle={title}
        description={description}
        baseParams={NEW_ARRIVALS}
        initialProducts={fallbackProducts}
        initialLastPage={fallbackLastPage}
        initialTotal={fallbackTotal}
        initialPage={1}
        pageSize={pageSize}
        cardLayout="market"
      />
    </>
  );
}
