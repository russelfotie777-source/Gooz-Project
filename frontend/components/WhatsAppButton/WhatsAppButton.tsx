"use client";

import { useDictionary } from "@/lib/i18n/I18nProvider";
import styles from "./WhatsAppButton.module.css";

// No Figma source — a standard floating WhatsApp contact button, mounted in
// the root layout so it shows on every page (mobile and desktop), unlike
// ScrollToTopButton which only lives inside Footer (desktop-only content
// pages). wa.me needs the number in plain international digits, no "+".
const WHATSAPP_NUMBER = "237688407756";

export default function WhatsAppButton() {
  const dict = useDictionary();

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label={dict.whatsapp.label}
    >
      <WhatsAppIcon className={styles.icon} />
    </a>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.41-1.42a9.87 9.87 0 0 0 4.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.19 0 4.25.85 5.8 2.4a8.19 8.19 0 0 1 2.4 5.83c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.21.84.86-3.13-.2-.32a8.15 8.15 0 0 1-1.26-4.38c0-4.55 3.7-8.15 8.35-8.15Zm-4.5 4.36c-.16 0-.42.06-.64.31-.22.25-.85.83-.85 2.02s.87 2.35 1 2.51c.12.16 1.7 2.7 4.19 3.68 2.07.81 2.49.65 2.94.61.45-.04 1.44-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.35-.76-1.84-.2-.48-.4-.42-.55-.43h-.47Z" />
    </svg>
  );
}
