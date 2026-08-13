"use client";

import Link from "next/link";
import Header from "@/components/Header/Header";
import { useCheckout } from "./CheckoutContext";
import styles from "./CheckoutMobileShell.module.css";

interface CheckoutMobileShellProps {
  step: 1 | 2 | 3;
  children: React.ReactNode;
  continueLabel: string;
  continueDisabled?: boolean;
  onContinue: () => void;
}

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

// Figma mobile checkout: node 556:63 (step 1), 567:357 (step 2), 607:315
// (step 3) all share this back+title+info header, step indicator and fixed
// Total/Continuez bar — only the middle content differs per step. The real
// /checkout endpoint requires auth (API.md §6), so cartStatus (loggedOut /
// empty / loading) short-circuits straight to a message instead of the
// step UI on any of the 4 routes.
export default function CheckoutMobileShell({
  step,
  children,
  continueLabel,
  continueDisabled,
  onContinue,
}: CheckoutMobileShellProps) {
  const { total, cartStatus } = useCheckout();

  if (cartStatus !== "ready") {
    return (
      <div className={styles.page}>
        <Header variant="cart" />
        <main className={styles.main}>
          <div className={styles.gate}>
            {cartStatus === "loading" && <p>Chargement...</p>}
            {cartStatus === "loggedOut" && (
              <>
                <p>Connectez-vous pour finaliser votre commande.</p>
                <Link href="/connexion" className={styles.gateLink}>
                  Se connecter
                </Link>
              </>
            )}
            {cartStatus === "empty" && (
              <>
                <p>Votre panier est vide.</p>
                <Link href="/cart" className={styles.gateLink}>
                  Voir le panier
                </Link>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header variant="cart" />

      <main className={styles.main}>
        <div className={styles.stepIndicator}>
          <img src="/icon/checkout/step-location.svg" alt="Adresse" className={styles.stepIcon} />
          <span className={`${styles.stepDash} ${step > 1 ? styles.stepDashActive : ""}`} />
          <img
            src={step >= 2 ? "/icon/checkout/step-shipping-active.svg" : "/icon/checkout/step-shipping.svg"}
            alt="Livraison"
            className={styles.stepIcon}
          />
          <span className={`${styles.stepDash} ${step > 2 ? styles.stepDashActive : ""}`} />
          <img src="/icon/checkout/step-card.svg" alt="Paiement" className={styles.stepIcon} />
        </div>

        {children}
      </main>

      <div className={styles.totalBar}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total :</span>
          <span className={styles.totalValue}>{formatPrice(total)}</span>
        </div>
        <button
          type="button"
          className={styles.continueButton}
          onClick={onContinue}
          disabled={continueDisabled}
        >
          {continueLabel}
          <img src="/icon/cart/arrow-right.svg" alt="" className={styles.continueArrow} />
        </button>
      </div>
    </div>
  );
}
