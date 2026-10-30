"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

// Replaces `router.push("/dashboard/x")` after a save/cancel on an edit or
// detail page. A bare push to the list's root path always lands on page 1
// (no ?page=), undoing whatever page the admin was actually on — see
// usePageParam(). router.back() instead returns to the exact list URL
// (including its ?page=N) the admin came from.
//
// Falls back to a plain push only when there's genuinely nothing to go
// back to in this tab (e.g. the edit page was opened directly from a
// pasted link rather than navigated to from the list) — router.back() on
// an empty history silently does nothing, which would otherwise strand the
// admin on the edit page after a successful save.
export function useGoBack(fallback: string) {
  const router = useRouter();

  return useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }, [router, fallback]);
}
