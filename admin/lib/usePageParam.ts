"use client";

import { useCallback, useMemo, type Dispatch, type SetStateAction } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// A drop-in replacement for `useState(1)` for a list page's current page
// number — keeps it in the URL (?page=N) instead of component state.
//
// Component state is wiped every time the list page unmounts, which
// happens on every navigation to an edit/detail page (a different route
// segment): editing an item on page 3, saving, and navigating back always
// remounted the list fresh at page 1. Storing it in the URL instead means
// the list page reads the right page back out of its own URL on remount —
// paired with useGoBack(), which returns to that exact URL rather than a
// bare `/dashboard/x`.
//
// Same read/write shape as useState's tuple (including the functional
// updater form, e.g. setPage((p) => p + 1)), so switching a page over is a
// one-line change with no other code touched.
export function usePageParam(): [number, Dispatch<SetStateAction<number>>] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = useMemo(() => {
    const raw = Number(searchParams.get("page"));
    return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
  }, [searchParams]);

  const setPage = useCallback<Dispatch<SetStateAction<number>>>(
    (value) => {
      const next = typeof value === "function" ? (value as (p: number) => number)(page) : value;
      const params = new URLSearchParams(searchParams.toString());
      if (next <= 1) params.delete("page");
      else params.set("page", String(next));
      const query = params.toString();
      // replace, not push: flipping through pages (or a search resetting
      // back to page 1) shouldn't pile up browser-history entries — only
      // the one URL a user actually left from (to go edit/view an item)
      // needs to be back()-able to.
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [page, router, pathname, searchParams]
  );

  return [page, setPage];
}
