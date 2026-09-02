"use client";

import { useState } from "react";
import { refreshOrderPayment } from "./api";
import { getSession } from "./auth";
import { useLocaleRouter } from "./i18n/useLocaleRouter";
import type { Order } from "./types";

// A mobile money order can be retried as long as it hasn't actually
// succeeded (or been refunded/cancelled) — covers both "échoué" and an
// order stuck "en_attente" because the initial Enkap order creation itself
// failed during checkout (see CheckoutController::store's comment on that).
export function canRetryPayment(order: Order): boolean {
  return (
    order.payment.payment_method === "mobile_money" &&
    order.payment.payment_status !== "payé" &&
    order.payment.payment_status !== "remboursé" &&
    order.status !== "annulée"
  );
}

// Shared by OrderHistoryPage (mobile) and OrderHistoryDesktop: sends the
// shopper back to Enkap's hosted checkout page for an order whose payment
// never went through. Reuses PaymentController::refresh, which already
// knows to start a brand new Enkap order when the previous attempt failed
// rather than re-checking a dead transaction.
export function usePaymentRetry() {
  const router = useLocaleRouter();
  const [retryingId, setRetryingId] = useState<number | null>(null);
  const [retryErrorId, setRetryErrorId] = useState<number | null>(null);

  async function retry(order: Order) {
    const session = getSession();
    if (!session) {
      router.push("/connexion");
      return;
    }

    setRetryErrorId(null);
    setRetryingId(order.id);
    try {
      const result = await refreshOrderPayment(session.token, order.order_reference);
      if (result.payment.checkout_url) {
        window.location.href = result.payment.checkout_url;
        return;
      }
      setRetryErrorId(order.id);
    } catch {
      setRetryErrorId(order.id);
    } finally {
      setRetryingId(null);
    }
  }

  return { retry, retryingId, retryErrorId };
}
