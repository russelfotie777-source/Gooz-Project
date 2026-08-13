import Link from "next/link";
import styles from "./CheckoutConfirmationStep.module.css";

interface CheckoutSuccessContentProps {
  orderNumber: string;
}

// Shared between the mobile confirmation route (node 631:304) and the
// desktop single-page checkout, which shows this same success state inline
// instead of navigating away (each has its own CheckoutProvider instance, so
// a shared route/context wouldn't carry the desktop order number across).
export default function CheckoutSuccessContent({ orderNumber }: CheckoutSuccessContentProps) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Bravooo !!!</h1>
      <p className={styles.subtitle}>Votre commande a été transmise avec succès</p>

      <img src="/icon/checkout/success-basket.svg" alt="" className={styles.icon} />

      <p className={styles.orderLabel}>votre numéro de commande est le :</p>
      <p className={styles.orderNumber}>{orderNumber}</p>

      <p className={styles.contact}>
        En cas de besoin d&apos;aide, d&apos;information ou de service contactez nous au{" "}
        <span className={styles.contactNumber}>670 25 14 47</span>
      </p>

      <Link href="/" className={styles.homeButton}>
        <img src="/icon/checkout/arrow-left.svg" alt="" className={styles.homeArrow} />
        Retour à l&apos;accueil
        <img src="/icon/cart/arrow-right.svg" alt="" className={styles.homeArrowFlipped} />
      </Link>
    </div>
  );
}
