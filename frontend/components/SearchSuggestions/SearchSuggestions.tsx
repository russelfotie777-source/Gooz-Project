"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { getDisplayVariant } from "@/lib/pricing";
import { productPath } from "@/lib/productUrl";
import type { Product } from "@/lib/types";
import styles from "./SearchSuggestions.module.css";

interface SearchSuggestionsProps {
  query: string;
  /** Called once a suggestion is actually picked — lets the Header close
   *  the dropdown and clear the "is this input focused" state driving it. */
  onSelect: () => void;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const SUGGESTION_COUNT = 5;

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

// Mounted next to both the desktop and mobile search inputs (see Header.tsx)
// whenever one of them is focused — reuses ProductController's own search
// (now tiered: exact words, then any word, then a typo-tolerant fallback —
// see applySearch()/fuzzySearch() there) rather than a separate endpoint, so
// "did you mean" behavior only has to exist in one place.
export default function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const dict = useDictionary();
  const trimmed = query.trim();
  const [results, setResults] = useState<Product[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");

  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setStatus("idle");
      setResults([]);
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const timer = window.setTimeout(() => {
      getProducts({ q: trimmed, per_page: SUGGESTION_COUNT })
        .then((products) => {
          if (cancelled) return;
          setResults(products);
          setStatus("ready");
        })
        .catch(() => {
          if (cancelled) return;
          setResults([]);
          setStatus("ready");
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed]);

  if (trimmed.length < MIN_QUERY_LENGTH) return null;

  return (
    <div className={styles.dropdown} role="listbox">
      {status === "loading" && results.length === 0 ? (
        <p className={styles.message}>{dict.header.searchLoading}</p>
      ) : results.length === 0 ? (
        <p className={styles.message}>{dict.header.searchNoResults}</p>
      ) : (
        <ul className={styles.list}>
          {results.map((product) => {
            const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];
            const variant = getDisplayVariant(product);
            return (
              <li key={product.id}>
                <LocaleLink href={productPath(product)} className={styles.item} onClick={onSelect}>
                  <span className={styles.thumbWrapper}>
                    {primaryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primaryImage.thumbnail_url ?? primaryImage.image_url}
                        alt=""
                        className={styles.thumb}
                      />
                    ) : (
                      <span className={styles.thumbPlaceholder} aria-hidden="true" />
                    )}
                  </span>
                  <span className={styles.itemText}>
                    <span className={styles.itemName}>{product.name}</span>
                    {variant && <span className={styles.itemPrice}>{formatPrice(variant.price)}</span>}
                  </span>
                </LocaleLink>
              </li>
            );
          })}
        </ul>
      )}

      <LocaleLink
        href={`/recherche?q=${encodeURIComponent(trimmed)}`}
        className={styles.seeAll}
        onClick={onSelect}
      >
        {dict.header.searchSeeAll(trimmed)}
      </LocaleLink>
    </div>
  );
}
