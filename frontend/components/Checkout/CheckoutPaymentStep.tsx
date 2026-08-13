"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutMobileShell from "./CheckoutMobileShell";
import { useCheckout } from "./CheckoutContext";
import styles from "./CheckoutPaymentStep.module.css";

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export default function CheckoutPaymentStep() {
  const router = useRouter();
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
    checkoutError,
    placeOrder,
  } = useCheckout();
  const [placing, setPlacing] = useState(false);

  const livraison = deliveryMethod === "domicile" ? deliveryFee : 0;

  // Navigate only once orderNumber has actually committed to context state —
  // pushing immediately after calling placeOrder() races the confirmation
  // page's own "no order yet" redirect guard, since router.push can run
  // before the setOrderNumber update has flushed.
  useEffect(() => {
    if (placing && orderNumber) {
      router.push("/checkout/confirmation");
    }
  }, [placing, orderNumber, router]);

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
      continueLabel={placing ? "Envoi..." : "Commander"}
      continueDisabled={!paymentMethod || placing}
      onContinue={handleOrder}
    >
      <div className={styles.summaryCard}>
        <div className={styles.summaryRow}>
          <span>Sous total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Réduction</span>
          <span>{formatPrice(0)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Livraison (Expédition)</span>
          <span>{formatPrice(livraison)}</span>
        </div>
        <div className={styles.divider} />
        <div className={`${styles.summaryRow} ${styles.summaryTotalRow}`}>
          <span>Total :</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div>
        <h1 className={styles.title}>Methode de paiement</h1>

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
          <span className={styles.paymentLabel}>Paiement cash à la livraison</span>
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
          <span className={styles.paymentLabel}>Paiement en ligne</span>
          <span className={styles.onlineIcons}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon/checkout/payment-orange.png" alt="Orange Money" className={styles.onlineIcon} />
            <span className={styles.onlineOu}>ou</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon/checkout/payment-mtn.png" alt="MTN Mobile Money" className={styles.onlineIcon} />
          </span>
        </button>
      </div>

      <div>
        <p className={styles.couponLabel}>Vous avez un coupon de réduction?</p>
        <div className={styles.couponRow}>
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Saisissez le code ici"
            className={styles.couponInput}
          />
          <button type="button" className={styles.couponApply}>
            Appliquer
            <img src="/icon/cart/coupon-check.svg" alt="" className={styles.couponApplyIcon} />
          </button>
        </div>
      </div>

      {checkoutError && <p className={styles.error}>{checkoutError}</p>}
    </CheckoutMobileShell>
  );
}
