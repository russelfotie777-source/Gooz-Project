"use client";

import { useEffect, useState } from "react";
import { ApiValidationError, getOrderByReference } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import type { Order } from "@/lib/types";
import { canRetryPayment, usePaymentRetry } from "@/lib/usePaymentRetry";
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
  const [order, setOrder] = useState<Order | null>(null);
  const { retry, retryingId, retryErrorId } = usePaymentRetry();

  function check() {
    const session = getSession();
    if (!session) {
      router.replace("/connexion");
      return;
    }

    setStatus("checking");
    getOrderByReference(session.token, reference)
      .then((result) => {
        setOrder(result);
        setStatus("ready");
      })
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

  // status === "ready" from here. A mobile money order that was abandoned
  // on Enkap (never actually paid) and revisited here — e.g. via the
  // sessionStorage-persisted orderNumber on a fresh page load, not through
  // Enkap's own returnUrl (that's PaymentReturnPage, which already handles
  // this) — isn't "confirmed": showing the success screen would tell the
  // shopper they paid when they didn't. Cash orders stay "en_attente" until
  // collected on delivery, which IS the normal confirmed state, so only
  // mobile money is special-cased.
  if (order && canRetryPayment(order)) {
    // Never redirect straight to order.payment.checkout_url here: it's
    // whatever Enkap returned when this transaction was first created,
    // which can go stale on Enkap's own hosted payment page well before the
    // transaction itself is marked "échoué" on our side — reusing it 401s
    // on Enkap, not us. retry() (force=true) always asks the backend for a
    // brand new session before redirecting, whether this one is "échoué" or
    // just abandoned mid-"en_attente".
    const failed = order.payment.payment_status === "échoué";
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>
          {failed ? dict.checkout.paymentReturn.failedTitle : dict.checkout.redirecting.title}
        </h1>
        <p className={styles.subtitle}>
          {failed ? dict.checkout.paymentReturn.failedSubtitle : dict.checkout.redirecting.subtitle}
        </p>
        <button
          type="button"
          className={styles.homeButton}
          disabled={retryingId === order.id}
          onClick={() => retry(order)}
        >
          {retryingId === order.id
            ? dict.orders.payNowLoading
            : failed
              ? dict.checkout.paymentReturn.retryPayment
              : dict.checkout.redirecting.continueButton}
        </button>
        {retryErrorId === order.id && <p className={styles.contact}>{dict.checkout.paymentReturn.retryPaymentError}</p>}
      </div>
    );
  }

  return <CheckoutSuccessContent orderNumber={reference} />;
}
