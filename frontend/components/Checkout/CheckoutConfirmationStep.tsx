"use client";

import { useEffect } from "react";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { useCheckout } from "./CheckoutContext";

// Bare /checkout/confirmation (no reference in the URL) is only ever reached
// via an old bookmark/history entry from before confirmation pages carried
// their reference in the URL — see CheckoutPaymentStep, which now redirects
// straight to /checkout/confirmation/[reference]. This route's only job is
// to bounce forward to that form using whatever the context/sessionStorage
// still remembers, or back to step 1 if it remembers nothing.
export default function CheckoutConfirmationStep() {
  const router = useLocaleRouter();
  const { orderNumber } = useCheckout();

  useEffect(() => {
    if (orderNumber) {
      router.replace(`/checkout/confirmation/${encodeURIComponent(orderNumber)}`);
    } else {
      router.replace("/checkout/adresse");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  return null;
}
