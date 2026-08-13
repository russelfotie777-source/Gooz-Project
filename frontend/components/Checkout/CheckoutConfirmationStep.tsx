"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "./CheckoutContext";
import CheckoutSuccessContent from "./CheckoutSuccessContent";

export default function CheckoutConfirmationStep() {
  const router = useRouter();
  const { orderNumber } = useCheckout();

  useEffect(() => {
    if (!orderNumber) {
      router.replace("/checkout/adresse");
    }
  }, [orderNumber, router]);

  if (!orderNumber) return null;

  return <CheckoutSuccessContent orderNumber={orderNumber} />;
}
