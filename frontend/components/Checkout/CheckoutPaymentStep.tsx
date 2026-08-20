"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import CheckoutMobileShell from "./CheckoutMobileShell";
import CheckoutRedirectingContent from "./CheckoutRedirectingContent";
import { useCheckout } from "./CheckoutContext";
import styles from "./CheckoutPaymentStep.module.css";

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export default function CheckoutPaymentStep() {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const {
    isAddressComplete,
    subtotal,
    deliveryMethod,
    deliveryFee,
    paymentMethod,
    setPaymentMethod,
    coupon,
    setCoupon,
    couponStatus,
    couponError,
    discountAmount,
    applyCoupon,
    total,
    orderNumber,
    checkoutUrl,
    placeOrder,
  } = useCheckout();
  const [placing, setPlacing] = useState(false);

  const livraison = deliveryMethod === "domicile" ? deliveryFee : 0;

  // Reaching this step directly (typed URL, or stepping back after already
  // moving on) without the prerequisite steps used to fail silently —
  // placeOrder() just returns early with no message when deliveryMethod
  // isn't set (see CheckoutContext), leaving the "Envoi..." button stuck.
  // Bouncing back to the missing step here means placeOrder() is never even
  // reachable in that state.
  useEffect(() => {
    if (!isAddressComplete) {
      router.replace("/checkout/adresse");
    } else if (!deliveryMethod) {
      router.replace("/checkout/livraison");
    }
  }, [isAddressComplete, deliveryMethod, router]);

  // Runs on every mount, not just right after a successful placeOrder() call
  // in this same component instance: orderNumber is restored from
  // sessionStorage even after a full reload (e.g. the browser's back button
  // after being sent to Enkap), so this also closes off the "back + click
  // Commander again" double-order risk — once orderNumber exists, the
  // payment form itself never renders again (see the early returns below).
  useEffect(() => {
    if (orderNumber && !checkoutUrl) {
      // The reference lives in the URL itself, not just in sessionStorage —
      // a refresh, a bookmarked/shared link, or sessionStorage being cleared
      // all still land on the right confirmation instead of bouncing back
      // to step 1.
      router.replace(`/checkout/confirmation/${encodeURIComponent(orderNumber)}`);
    }
  }, [orderNumber, checkoutUrl, router]);

  async function handleOrder() {
    setPlacing(true);
    try {
      await placeOrder();
    } catch {
      setPlacing(false);
    }
  }

  if (orderNumber && checkoutUrl) {
    return <CheckoutRedirectingContent checkoutUrl={checkoutUrl} />;
  }

  if (!isAddressComplete || !deliveryMethod || orderNumber) return null;

  return (
    <CheckoutMobileShell
      step={3}
      continueLabel={placing ? dict.checkout.sendingButton : dict.checkout.orderButton}
      continueDisabled={!paymentMethod || placing || Boolean(orderNumber)}
      onContinue={handleOrder}
    >
      <div className={styles.summaryCard}>
        <div className={styles.summaryRow}>
          <span>{dict.checkout.subtotal}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>{dict.checkout.discount}</span>
          <span>{formatPrice(discountAmount)}</span>
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
          <button
            type="button"
            className={styles.couponApply}
            onClick={applyCoupon}
            disabled={!coupon.trim() || couponStatus === "checking"}
          >
            {couponStatus === "checking" ? dict.cart.couponChecking : dict.cart.applyCoupon}
            <img src="/icon/cart/coupon-check.svg" alt="" className={styles.couponApplyIcon} />
          </button>
        </div>
        {couponStatus === "applied" && <p className={styles.couponSuccess}>{dict.cart.couponApplied}</p>}
        {couponStatus === "invalid" && couponError && <p className={styles.error}>{couponError}</p>}
      </div>
    </CheckoutMobileShell>
  );
}
