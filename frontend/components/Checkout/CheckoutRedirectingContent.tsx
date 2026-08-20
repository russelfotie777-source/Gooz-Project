"use client";

import { useEffect } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import styles from "./CheckoutConfirmationStep.module.css";

interface CheckoutRedirectingContentProps {
  checkoutUrl: string;
}

const AUTO_REDIRECT_DELAY_MS = 2000;

// Shown right after an "online" order is created, before sending the browser
// to Enkap's hosted payment page — an instant window.location.href jump to a
// third-party domain with no explanation reads as suspicious rather than as
// a normal payment step. This gives the shopper a moment to read what's
// happening and a real link to click immediately, rather than being
// silently redirected out from under them.
export default function CheckoutRedirectingContent({ checkoutUrl }: CheckoutRedirectingContentProps) {
  const dict = useDictionary();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = checkoutUrl;
    }, AUTO_REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [checkoutUrl]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{dict.checkout.redirecting.title}</h1>
      <p className={styles.subtitle}>{dict.checkout.redirecting.subtitle}</p>

      <a href={checkoutUrl} className={styles.homeButton}>
        {dict.checkout.redirecting.continueButton}
        <img src="/icon/cart/arrow-right.svg" alt="" className={styles.homeArrowFlipped} />
      </a>
    </div>
  );
}
