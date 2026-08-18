"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import CheckoutMobileShell from "./CheckoutMobileShell";
import { useCheckout } from "./CheckoutContext";
import styles from "./CheckoutPaymentStep.module.css";

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export default function CheckoutPaymentStep() {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const {
    subtotal,
    deliveryMethod,
    deliveryFee,
    paymentMethod,
    setPaymentMethod,
    coupon,
    setCoupon,
    total,
    orderNumber,
    checkoutUrl,
    checkoutError,
    placeOrder,
  } = useCheckout();
  const [placing, setPlacing] = useState(false);

  const livraison = deliveryMethod === "domicile" ? deliveryFee : 0;

  // Navigate only once orderNumber has actually committed to context state —
  // pushing immediately after calling placeOrder() races the confirmation
  // page's own "no order yet" redirect guard, since router.push can run
  // before the setOrderNumber update has flushed. Mobile money orders get a
  // checkoutUrl too: send the browser to Enkap's hosted payment page instead
  // of straight to our own confirmation page, which only makes sense once
  // the payment has actually gone through.
  useEffect(() => {
    if (!placing || !orderNumber) return;

    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      router.push("/checkout/confirmation");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placing, orderNumber, checkoutUrl]);

  async function handleOrder() {
    setPlacing(true);
    try {
      await placeOrder();
    } catch {
      setPlacing(false);
    }
  }

  return (
    <CheckoutMobileShell
      step={3}
      continueLabel={placing ? dict.checkout.sendingButton : dict.checkout.orderButton}
      continueDisabled={!paymentMethod || placing}
      onContinue={handleOrder}
    >
      <div className={styles.summaryCard}>
        <div className={styles.summaryRow}>
          <span>{dict.checkout.subtotal}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>{dict.checkout.discount}</span>
          <span>{formatPrice(0)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>{dict.checkout.deliveryExpedition}</span>
          <span>{formatPrice(livraison)}</span>
        </div>
        <div className={styles.divider} />
        <div className={`${styles.summaryRow} ${styles.summaryTotalRow}`}>
          <span>{dict.checkout.totalLabel}</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div>
        <h1 className={styles.title}>{dict.checkout.paymentMethodTitle}</h1>

        <button
          type="button"
          className={`${styles.paymentCard} ${paymentMethod === "cash" ? styles.paymentCardActive : ""}`}
          onClick={() => setPaymentMethod("cash")}
        >
          <img
            src={paymentMethod === "cash" ? "/icon/checkout/radio-checked.svg" : "/icon/checkout/radio-unchecked.svg"}
            alt=""
            className={styles.radioIcon}
          />
          <span className={styles.paymentLabel}>{dict.checkout.cashPaymentMobile}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon/checkout/payment-cash.png" alt="" className={styles.paymentIcon} />
        </button>

        <button
          type="button"
          className={`${styles.paymentCard} ${paymentMethod === "online" ? styles.paymentCardActive : ""}`}
          onClick={() => setPaymentMethod("online")}
        >
          <img
            src={paymentMethod === "online" ? "/icon/checkout/radio-checked.svg" : "/icon/checkout/radio-unchecked.svg"}
            alt=""
            className={styles.radioIcon}
          />
          <span className={styles.paymentLabel}>{dict.checkout.onlinePayment}</span>
          <span className={styles.onlineIcons}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon/checkout/payment-orange.png" alt="Orange Money" className={styles.onlineIcon} />
            <span className={styles.onlineOu}>{dict.checkout.or}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon/checkout/payment-mtn.png" alt="MTN Mobile Money" className={styles.onlineIcon} />
          </span>
        </button>
      </div>

      <div>
        <p className={styles.couponLabel}>{dict.cart.couponQuestion}</p>
        <div className={styles.couponRow}>
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder={dict.cart.couponPlaceholder}
            className={styles.couponInput}
          />
          <button type="button" className={styles.couponApply}>
            {dict.cart.applyCoupon}
            <img src="/icon/cart/coupon-check.svg" alt="" className={styles.couponApplyIcon} />
          </button>
        </div>
      </div>

      {checkoutError && <p className={styles.error}>{checkoutError}</p>}
    </CheckoutMobileShell>
  );
}
