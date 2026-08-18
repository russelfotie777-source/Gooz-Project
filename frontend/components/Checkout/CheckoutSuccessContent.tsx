"use client";

import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./CheckoutConfirmationStep.module.css";

interface CheckoutSuccessContentProps {
  orderNumber: string;
}

// Shared between the mobile confirmation route (node 631:304) and the
// desktop single-page checkout, which shows this same success state inline
// instead of navigating away (each has its own CheckoutProvider instance, so
// a shared route/context wouldn't carry the desktop order number across).
export default function CheckoutSuccessContent({ orderNumber }: CheckoutSuccessContentProps) {
  const dict = useDictionary();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{dict.checkout.success.title}</h1>
      <p className={styles.subtitle}>{dict.checkout.success.subtitle}</p>

      <img src="/icon/checkout/success-basket.svg" alt="" className={styles.icon} />

      <p className={styles.orderLabel}>{dict.checkout.success.orderLabel}</p>
      <p className={styles.orderNumber}>{orderNumber}</p>

      <p className={styles.contact}>
        {dict.checkout.success.contactPrefix} <span className={styles.contactNumber}>670 25 14 47</span>
      </p>

      <LocaleLink href="/" className={styles.homeButton}>
        <img src="/icon/checkout/arrow-left.svg" alt="" className={styles.homeArrow} />
        {dict.checkout.success.backHome}
        <img src="/icon/cart/arrow-right.svg" alt="" className={styles.homeArrowFlipped} />
      </LocaleLink>
    </div>
  );
}
