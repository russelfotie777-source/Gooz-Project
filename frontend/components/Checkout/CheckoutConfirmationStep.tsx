"use client";

import { useEffect } from "react";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { useCheckout } from "./CheckoutContext";
import CheckoutSuccessContent from "./CheckoutSuccessContent";

export default function CheckoutConfirmationStep() {
  const router = useLocaleRouter();
  const { orderNumber } = useCheckout();

  useEffect(() => {
    if (!orderNumber) {
      router.replace("/checkout/adresse");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  if (!orderNumber) return null;

  return <CheckoutSuccessContent orderNumber={orderNumber} />;
}
