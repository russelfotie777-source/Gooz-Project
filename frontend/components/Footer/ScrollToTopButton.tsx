"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import styles from "./ScrollToTopButton.module.css";

// No Figma source — this is the standard "back to top" convenience button
// found on most sites, not part of any design. Desktop only (mobile already
// has BottomNav occupying that corner of the screen), and only shows once
// the shopper has actually scrolled down a bit.
export default function ScrollToTopButton() {
  const dict = useDictionary();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${visible ? styles.visible : ""}`}
      onClick={scrollToTop}
      aria-label={dict.scrollTop.label}
      tabIndex={visible ? 0 : -1}
    >
      <svg viewBox="0 0 20 20" fill="none" className={styles.icon}>
        <path
          d="M10 15V5M5 9l5-5 5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
