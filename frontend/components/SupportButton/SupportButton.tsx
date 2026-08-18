"use client";

import { useState } from "react";
import TicketModal from "@/components/TicketModal/TicketModal";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import styles from "./SupportButton.module.css";

// Desktop-only floating button (mirrors WhatsAppButton's fixed-corner style,
// stacked above it + ScrollToTopButton) that opens the ticket-creation
// dialog. On mobile the same TicketModal is reached instead via the "Nous
// contacter" row in the profile pages — no floating button there, per the
// user's request, to avoid crowding the WhatsApp/scroll-to-top corner.
export default function SupportButton() {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        aria-label={dict.tickets.floatingButtonLabel}
        onClick={() => setOpen(true)}
      >
        <SupportIcon className={styles.icon} />
      </button>

      <TicketModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function SupportIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
