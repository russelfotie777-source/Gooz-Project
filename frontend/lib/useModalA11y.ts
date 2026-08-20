"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared by every modal (DeleteAccountModal, EditProfileModal,
// LogoutConfirmModal, CompletePhoneModal, ...): traps Tab focus inside the
// modal while it's open, moves focus in on open and back to whatever
// triggered it on close, and closes on Escape. The first modal built here
// shipped without any of this, and it got copied into three more before
// being fixed once, at the source, instead of four times.
export function useModalA11y(
  open: boolean,
  onClose: (() => void) | undefined,
  containerRef: React.RefObject<HTMLElement | null>
): void {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const focusables = container ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
    (focusables[0] ?? container)?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }

      if (e.key !== "Tab" || !container) return;

      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose, containerRef]);
}
