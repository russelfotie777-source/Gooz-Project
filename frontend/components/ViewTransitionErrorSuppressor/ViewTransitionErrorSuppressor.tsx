"use client";

import { useEffect } from "react";

// React's experimental <ViewTransition> (used by BottomNav's tab-switch
// animation — see next.config.ts's experimental.viewTransition) calls the
// browser's native document.startViewTransition() under the hood. If the
// document becomes hidden (phone locks, app gets backgrounded, tab loses
// focus) before that transition's `ready` promise settles, Chromium
// rejects it with an InvalidStateError — and React doesn't catch that
// rejection itself, so it surfaces as an "unhandled rejection", which
// Next's dev overlay then shows as a "Recoverable" error. This is a known
// upstream bug (react/react#37751, react/react#34098), not something wrong
// in this app: the DOM update underneath still applies correctly, only the
// animation gets skipped. Swallowing just this specific rejection here
// stops it from reaching the overlay/console without hiding any other,
// genuinely unhandled rejection.
export default function ViewTransitionErrorSuppressor() {
  useEffect(() => {
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const isViewTransitionAbort =
        reason instanceof DOMException &&
        reason.name === "InvalidStateError" &&
        reason.message.includes("Transition was aborted");

      if (isViewTransitionAbort) {
        event.preventDefault();
      }
    }

    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return null;
}
