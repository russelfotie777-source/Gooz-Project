"use client";

import { useEffect, useState } from "react";
import { ApiValidationError, getOrderByReference } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import CheckoutSuccessContent from "./CheckoutSuccessContent";
import styles from "./CheckoutConfirmationStep.module.css";

interface CheckoutConfirmationVerifiedProps {
  reference: string;
}

// The reference comes from the URL, which anyone can type/share/edit — this
// verifies it's a real order that actually belongs to the signed-in shopper
// (GET /orders/reference/{ref} 403s otherwise) before showing a "your order
// is confirmed" screen, rather than trusting the URL segment on its own.
export default function CheckoutConfirmationVerified({ reference }: CheckoutConfirmationVerifiedProps) {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "notFound" | "error">("checking");

  function check() {
    const session = getSession();
    if (!session) {
      router.replace("/connexion");
      return;
    }

    setStatus("checking");
    getOrderByReference(session.token, reference)
      .then(() => setStatus("ready"))
      .catch((err) => {
        // 403/404: the reference is real but not this shopper's, or doesn't
        // exist at all — a genuinely wrong/tampered URL, not worth retrying.
        // Anything else (401, 5xx, offline) is a technical hiccup: a real
        // 401 already gets its own global "session expired" toast + cleared
        // session from authedFetch, so this just needs a retry-able state.
        const notFound = err instanceof ApiValidationError && (err.status === 403 || err.status === 404);
        setStatus(notFound ? "notFound" : "error");
      });
  }

  useEffect(check, [reference]);

  if (status === "checking") {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{dict.checkout.confirmationVerify.checkingTitle}</h1>
        <p className={styles.subtitle}>{dict.checkout.confirmationVerify.checkingSubtitle}</p>
      </div>
    );
  }

  if (status === "notFound") {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{dict.checkout.confirmationVerify.notFoundTitle}</h1>
        <p className={styles.subtitle}>{dict.checkout.confirmationVerify.notFoundSubtitle}</p>
        <LocaleLink href="/commandes" className={styles.homeButton}>
          {dict.checkout.paymentReturn.viewOrder}
        </LocaleLink>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{dict.checkout.confirmationVerify.loadErrorTitle}</h1>
        <p className={styles.subtitle}>{dict.checkout.confirmationVerify.loadErrorSubtitle}</p>
        <button type="button" className={styles.homeButton} onClick={check}>
          {dict.checkout.paymentReturn.retryCheck}
        </button>
      </div>
    );
  }

  return <CheckoutSuccessContent orderNumber={reference} />;
}
