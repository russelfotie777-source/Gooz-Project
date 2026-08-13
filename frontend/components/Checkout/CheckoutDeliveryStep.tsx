"use client";

import { useRouter } from "next/navigation";
import CheckoutMobileShell from "./CheckoutMobileShell";
import { useCheckout } from "./CheckoutContext";
import styles from "./CheckoutDeliveryStep.module.css";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export default function CheckoutDeliveryStep() {
  const router = useRouter();
  const { items, deliveryMethod, setDeliveryMethod, deliveryFee, deliveryStatus, warehouse } = useCheckout();

  return (
    <CheckoutMobileShell
      step={2}
      continueLabel="Continuez"
      continueDisabled={!deliveryMethod}
      onContinue={() => router.push("/checkout/paiement")}
    >
      <div>
        <h1 className={styles.title}>Résumé de votre panier</h1>
        <div className={styles.summaryCard}>
          {items.map((item) => {
            const image = item.product.images.find((img) => img.is_primary) ?? item.product.images[0];
            return (
              <div key={item.id} className={styles.summaryRow}>
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image?.image_url ?? PLACEHOLDER_IMAGE}
                    alt={item.product.name}
                    className={styles.image}
                    onError={(e) => {
                      if (e.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) return;
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
                <div className={styles.summaryInfo}>
                  <p className={styles.summaryName}>{item.product.name}</p>
                  <p className={styles.summaryPrice}>{formatPrice(item.line_total)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h1 className={styles.title}>Lieux de livraison</h1>
        <div className={styles.methods}>
          <button
            type="button"
            className={`${styles.methodCard} ${deliveryMethod === "domicile" ? styles.methodCardActive : ""}`}
            onClick={() => setDeliveryMethod("domicile")}
          >
            <div className={styles.methodTop}>
              <img
                src={deliveryMethod === "domicile" ? "/icon/checkout/radio-checked.svg" : "/icon/checkout/radio-unchecked.svg"}
                alt=""
                className={styles.radioIcon}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon/checkout/delivery-home-photo.png" alt="" className={styles.methodPhoto} />
            </div>
            <p className={styles.methodLabel}>Livraison à domicile</p>
            <p className={styles.methodHint}>Nous vous livrons</p>
            <p className={styles.methodFee}>
              Frais :{" "}
              <span className={styles.methodFeeValue}>
                {deliveryMethod === "domicile" && deliveryStatus === "loading"
                  ? "Calcul..."
                  : deliveryMethod === "domicile" && deliveryStatus === "error"
                    ? "Indisponible"
                    : deliveryMethod === "domicile"
                      ? formatPrice(deliveryFee)
                      : "—"}
              </span>
            </p>
          </button>

          <button
            type="button"
            className={`${styles.methodCard} ${deliveryMethod === "agence" ? styles.methodCardActive : ""}`}
            onClick={() => setDeliveryMethod("agence")}
          >
            <div className={styles.methodTop}>
              <img
                src={deliveryMethod === "agence" ? "/icon/checkout/radio-checked.svg" : "/icon/checkout/radio-unchecked.svg"}
                alt=""
                className={styles.radioIcon}
              />
              <img src="/icon/checkout/storefront.svg" alt="" className={styles.methodIcon} />
            </div>
            <p className={styles.methodLabel}>Retrait en agence</p>
            <p className={styles.methodHint}>{warehouse ? warehouse.name : "Retrait en agence"}</p>
            <p className={styles.methodFee}>
              Frais : <span className={styles.methodFeeValue}>{formatPrice(0)}</span>
            </p>
          </button>
        </div>
      </div>
    </CheckoutMobileShell>
  );
}
