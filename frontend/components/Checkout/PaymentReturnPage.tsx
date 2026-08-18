"use client";

import { useEffect, useState } from "react";
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

// Landed on after the customer completes (or abandons) payment on Enkap's
// hosted page — reached via the merchant-wide returnUrl configured on the
// Enkap side, which appends "/{merchantReference}" (our order_reference).
// Re-checks the authoritative status via PaymentController::refresh rather
// than trusting anything encoded in the URL itself.
export default function PaymentReturnPage({ reference }: PaymentReturnPageProps) {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [checking, setChecking] = useState(true);

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
    } catch {
      // Keep whatever we last had (possibly nothing) — the retry button
      // below lets the customer try the status check again.
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking && !order) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{dict.checkout.paymentReturn.checkingTitle}</h1>
        <p className={styles.subtitle}>{dict.checkout.paymentReturn.checkingSubtitle}</p>
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

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{dict.checkout.paymentReturn.pendingTitle}</h1>
      <p className={styles.subtitle}>{dict.checkout.paymentReturn.pendingSubtitle}</p>
      <button type="button" className={styles.homeButton} onClick={check} disabled={checking}>
        {dict.checkout.paymentReturn.retryCheck}
      </button>
    </div>
  );
}
