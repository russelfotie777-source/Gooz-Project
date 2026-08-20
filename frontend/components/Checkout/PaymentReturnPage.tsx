"use client";

import { useEffect, useRef, useState } from "react";
import { refreshOrderPayment } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import type { Order } from "@/lib/types";
import CheckoutSuccessContent from "./CheckoutSuccessContent";
import styles from "./CheckoutConfirmationStep.module.css";

interface PaymentReturnPageProps {
  reference: string;
}

const MAX_AUTO_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 3000;

// Landed on after the customer completes (or abandons) payment on Enkap's
// hosted page — reached via the merchant-wide returnUrl configured on the
// Enkap side, which appends "/{merchantReference}" (our order_reference).
// Re-checks the authoritative status via PaymentController::refresh rather
// than trusting anything encoded in the URL itself.
//
// Two failure modes need to stay visibly distinct here: the status check
// itself failing (network/backend issue — we don't actually know what
// happened to the payment) versus the payment genuinely still being
// processed (Enkap says "en_attente"). Collapsing both into one "en
// attente" message — the previous behavior — leaves a customer who really
// did pay with no way to tell "wait" from "something's broken, act".
export default function PaymentReturnPage({ reference }: PaymentReturnPageProps) {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [checking, setChecking] = useState(true);
  const [checkFailed, setCheckFailed] = useState(false);
  const attemptsRef = useRef(0);

  async function check() {
    const session = getSession();
    if (!session) {
      router.replace("/connexion");
      return;
    }

    setChecking(true);
    try {
      const result = await refreshOrderPayment(session.token, reference);
      setOrder(result);
      setCheckFailed(false);
    } catch {
      setCheckFailed(true);
    } finally {
      setChecking(false);
    }
  }

  function manualRetry() {
    attemptsRef.current = 0;
    check();
  }

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bounded auto-poll: only while the check itself is succeeding and Enkap
  // genuinely reports the payment as still pending. A failed check does not
  // retry itself — that's what the distinct "verification failed" state
  // and its manual retry button are for.
  useEffect(() => {
    if (checking || checkFailed || !order) return;
    if (order.payment.payment_status !== "en_attente") return;
    if (attemptsRef.current >= MAX_AUTO_ATTEMPTS) return;

    attemptsRef.current += 1;
    const timer = setTimeout(check, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking, checkFailed, order]);

  if (checking && !order) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{dict.checkout.paymentReturn.checkingTitle}</h1>
        <p className={styles.subtitle}>{dict.checkout.paymentReturn.checkingSubtitle}</p>
      </div>
    );
  }

  if (checkFailed) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{dict.checkout.paymentReturn.checkFailedTitle}</h1>
        <p className={styles.subtitle}>{dict.checkout.paymentReturn.checkFailedSubtitle}</p>
        <button type="button" className={styles.homeButton} onClick={manualRetry} disabled={checking}>
          {dict.checkout.paymentReturn.retryCheck}
        </button>
      </div>
    );
  }

  if (order?.payment.payment_status === "payé") {
    return <CheckoutSuccessContent orderNumber={order.order_reference} />;
  }

  if (order?.payment.payment_status === "échoué") {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{dict.checkout.paymentReturn.failedTitle}</h1>
        <p className={styles.subtitle}>{dict.checkout.paymentReturn.failedSubtitle}</p>
        <p className={styles.contact}>{dict.checkout.paymentReturn.contactSupport}</p>
        <LocaleLink href="/commandes" className={styles.homeButton}>
          {dict.checkout.paymentReturn.viewOrder}
        </LocaleLink>
      </div>
    );
  }

  const autoRetriesExhausted = attemptsRef.current >= MAX_AUTO_ATTEMPTS;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{dict.checkout.paymentReturn.pendingTitle}</h1>
      <p className={styles.subtitle}>
        {autoRetriesExhausted
          ? dict.checkout.paymentReturn.pendingGiveUpSubtitle
          : dict.checkout.paymentReturn.pendingSubtitle}
      </p>
      <button type="button" className={styles.homeButton} onClick={manualRetry} disabled={checking}>
        {dict.checkout.paymentReturn.retryCheck}
      </button>
    </div>
  );
}
