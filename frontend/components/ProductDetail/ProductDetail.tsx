"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addCartItem, ApiValidationError, getCities, getDeliveryEstimate, getNeighborhoods } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import type { City, Neighborhood, Product } from "@/lib/types";
import styles from "./ProductDetail.module.css";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

const FEATURES = [
  {
    icon: "/icon/product-detail/feature-delivery.png",
    label: "Livraison rapide",
    text: "Recevez vos commandes dans un délai inférieur ou égal à 72h.",
  },
  {
    icon: "/icon/product-detail/feature-payment.png",
    label: "Paiement sécurisé",
    text: "Paiement par MTN/Orange Money ou cash à la livraison.",
  },
  {
    icon: "/icon/product-detail/feature-support.png",
    label: "Service après-vente",
    text: "Tous les produits sur Shopitech sont vérifiés et garantis.",
  },
  {
    icon: "/icon/product-detail/feature-prime.svg",
    label: "Shopitech prime",
    text: "Votre fidélité est récompensée par l'excellence.",
  },
];

const MOODS = [
  { id: "very-dissatisfied", icon: "/icon/product-detail/mood-very-dissatisfied.svg", label: "Déçu" },
  { id: "worried", icon: "/icon/product-detail/mood-worried.svg", label: "Pas convaincu" },
  { id: "content", icon: "/icon/product-detail/mood-content.svg", label: "Correct" },
  { id: "calm", icon: "/icon/product-detail/mood-calm.svg", label: "Bien" },
  { id: "happy", icon: "/icon/product-detail/mood-happy.svg", label: "Très bien" },
] as const;

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

interface ProductDetailProps {
  product: Product;
}

// Figma: desktop node 975:5613, mobile node 223:189. The delivery box,
// feature badges and the two accordions only exist in the desktop design —
// mobile stops at description + buy button + reviews (see .module.css).
const GALLERY_SIZE = 3;

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const baseImages =
    product.images.length > 0
      ? product.images
      : [{ id: 0, image_url: PLACEHOLDER_IMAGE, is_primary: true, product_variant_id: null }];
  // Real products will eventually have several angles; pad with the same
  // image for now so the thumbnail rail/dots always show their full slots.
  const images = Array.from({ length: GALLERY_SIZE }, (_, i) => ({
    ...baseImages[i % baseImages.length],
    id: i,
  }));
  const [activeImage, setActiveImage] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);
  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");
  const [pickup, setPickup] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<"details" | "info" | null>(null);
  const [mood, setMood] = useState<(typeof MOODS)[number]["id"] | null>(null);
  const [comment, setComment] = useState("");
  const [addStatus, setAddStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [addMessage, setAddMessage] = useState<string | null>(null);

  const inStock = (product.stock_quantity ?? 0) > 0;

  // Cart routes require auth (API.md §4) — a guest is sent to sign in rather
  // than silently failing. Used by both buttons in .buyRow: the icon-only
  // one just adds and stays on the page, "Acheter (maintenant)" adds then
  // takes the shopper straight to their cart.
  async function handleAddToCart(goToCart: boolean) {
    const session = getSession();
    if (!session) {
      router.push("/connexion");
      return;
    }

    setAddStatus("adding");
    setAddMessage(null);
    try {
      const cart = await addCartItem(session.token, product.id, 1);
      notifyCartUpdated(cart.items.length);
      if (goToCart) {
        router.push("/cart");
        return;
      }
      setAddStatus("added");
      setAddMessage("Ajouté au panier !");
      window.setTimeout(() => setAddStatus("idle"), 1800);
    } catch (err) {
      setAddStatus("error");
      setAddMessage(
        err instanceof ApiValidationError ? (Object.values(err.errors)[0]?.[0] ?? err.message) : "Une erreur est survenue."
      );
      window.setTimeout(() => setAddStatus("idle"), 2500);
    }
  }

  useEffect(() => {
    getCities()
      .then(setCities)
      .catch(() => setCities([]));

    // Fetched once, up front: this list stays tiny (a handful of neighborhoods
    // per city), so filtering client-side on city change avoids an extra
    // network round-trip every time the user picks a city.
    getNeighborhoods()
      .then(setAllNeighborhoods)
      .catch(() => setAllNeighborhoods([]));
  }, []);

  useEffect(() => {
    setNeighborhoodId("");
    setDeliveryFee(null);
    setDeliveryStatus("idle");
  }, [cityId]);

  const neighborhoods = cityId
    ? allNeighborhoods.filter((n) => n.city_id === Number(cityId))
    : [];

  useEffect(() => {
    if (!neighborhoodId) {
      setDeliveryFee(null);
      setDeliveryStatus("idle");
      return;
    }

    setDeliveryStatus("loading");
    getDeliveryEstimate(Number(neighborhoodId))
      .then((estimate) => {
        setDeliveryFee(estimate.delivery_fee);
        setDeliveryStatus("idle");
      })
      .catch(() => {
        setDeliveryFee(null);
        setDeliveryStatus("error");
      });
  }, [neighborhoodId]);

  function toggleAccordion(name: "details" | "info") {
    setOpenAccordion((current) => (current === name ? null : name));
  }

  function handleTrackScroll() {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveImage(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goToImage(index: number) {
    const el = trackRef.current;
    if (el) {
      el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    }
    setActiveImage(index);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topRow}>
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            <div className={styles.swipeTrack} ref={trackRef} onScroll={handleTrackScroll}>
              {images.map((image) => (
                <div className={styles.swipeSlide} key={image.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.image_url ?? PLACEHOLDER_IMAGE}
                    alt={product.name}
                    className={styles.mainImage}
                    onError={(e) => {
                      if (e.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) return;
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
              ))}
            </div>

            <div className={styles.dots}>
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={`${styles.dot} ${index === activeImage ? styles.dotActive : ""}`}
                  onClick={() => goToImage(index)}
                  aria-label={`Voir l'image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className={styles.thumbnails}>
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className={`${styles.thumbnail} ${index === activeImage ? styles.thumbnailActive : ""}`}
                onClick={() => goToImage(index)}
                aria-label={`Voir l'image ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.image_url} alt="" className={styles.thumbnailImage} />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.info}>
          <h1 className={styles.name}>{product.name}</h1>

          <div className={styles.detailsRow}>
            <div className={styles.detailsLeft}>
              <div className={styles.metaRow}>
                <span className={`${styles.stockBadge} ${inStock ? styles.stockBadgeIn : styles.stockBadgeOut}`}>
                  {inStock ? (
                    <img src="/icon/product-detail/check-circle.svg" alt="" className={styles.stockIcon} />
                  ) : null}
                  {inStock ? "En Stock" : "Rupture de stock"}
                </span>

                <span className={styles.rating} aria-label="Note du produit">
                  {Array.from({ length: 5 }, (_, i) => (
                    <img key={i} src="/icon/product-detail/star.svg" alt="" className={styles.star} />
                  ))}
                </span>
              </div>

              <div className={styles.metaLine}>
                <span className={styles.metaLabel}>Catégorie :</span>
                <span className={styles.metaValue}>{product.category?.name ?? "—"}</span>
              </div>
              <div className={styles.metaLine}>
                <span className={styles.metaLabel}>Origine :</span>
                <span className={styles.metaValue}>{product.brand?.country_origin ?? "—"}</span>
              </div>

              <p className={styles.price}>
                {formatPrice(product.price)}
                {product.is_promotion && product.promo_price && (
                  <span className={styles.specialPriceTag}>prix spécial</span>
                )}
              </p>

              <div className={styles.descriptionBlock}>
                <h2 className={styles.descriptionTitle}>À propos du produit</h2>
                <p className={styles.description}>
                  {product.description ?? "Aucune description disponible."}
                </p>
              </div>

              <div className={styles.buyRow}>
                <button
                  type="button"
                  className={styles.buyButton}
                  disabled={!inStock || addStatus === "adding"}
                  onClick={() => handleAddToCart(true)}
                >
                  <img src="/icon/product-detail/basket-add.svg" alt="" className={styles.buyIcon} />
                  <span className={styles.buyButtonLabelDesktop}>Acheter</span>
                  <span className={styles.buyButtonLabelMobile}>Acheter maintenant</span>
                </button>

                <button
                  type="button"
                  className={styles.quickAddButton}
                  aria-label="Ajouter au panier"
                  disabled={!inStock || addStatus === "adding"}
                  onClick={() => handleAddToCart(false)}
                >
                  <img src="/icon/product-detail/add-to-cart.svg" alt="" className={styles.quickAddIcon} />
                </button>
              </div>

              {addMessage && (
                <p className={addStatus === "error" ? styles.addToCartError : styles.addToCartSuccess}>
                  {addMessage}
                </p>
              )}
            </div>

            <div className={styles.deliveryBox}>
              <p className={styles.deliveryPrompt}>
                <img src="/icon/product-detail/location.svg" alt="" className={styles.locationIcon} />
                Où souhaitez-vous être livré
              </p>

              <label className={styles.selectField}>
                <select value={cityId} onChange={(e) => setCityId(e.target.value)} className={styles.select}>
                  <option value="">Sélectionnez la ville</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <img src="/icon/product-detail/chevron-down.svg" alt="" className={styles.selectChevron} />
              </label>

              <label className={styles.selectField}>
                <select
                  value={neighborhoodId}
                  onChange={(e) => setNeighborhoodId(e.target.value)}
                  disabled={!cityId}
                  className={styles.select}
                >
                  <option value="">Sélectionnez le quartier</option>
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
                <img src="/icon/product-detail/chevron-down.svg" alt="" className={styles.selectChevron} />
              </label>

              <div className={styles.deliveryCost}>
                <span>Coût :</span>
                <span className={styles.deliveryCostValue}>
                  {pickup
                    ? formatPrice(0)
                    : deliveryStatus === "loading"
                      ? "Calcul en cours..."
                      : deliveryStatus === "error"
                        ? "Indisponible pour le moment"
                        : deliveryFee !== null
                          ? formatPrice(deliveryFee)
                          : "Calculé à la livraison"}
                </span>
              </div>

              <div className={styles.orDivider}>
                <span className={styles.orLine} />
                <span>ou</span>
                <span className={styles.orLine} />
              </div>

              <button
                type="button"
                className={`${styles.pickupButton} ${pickup ? styles.pickupButtonActive : ""}`}
                onClick={() => setPickup((v) => !v)}
              >
                <span className={styles.pickupLabel}>Récupérer en agence</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        {FEATURES.map((feature) => (
          <div key={feature.label} className={styles.featureCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={feature.icon} alt="" className={styles.featureIcon} />
            <div>
              <p className={styles.featureLabel}>{feature.label}</p>
              <p className={styles.featureText}>{feature.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.accordions}>
        <div className={styles.accordion}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => toggleAccordion("details")}
            aria-expanded={openAccordion === "details"}
          >
            <span>Détails du produit</span>
            <img
              src="/icon/product-detail/chevron-down.svg"
              alt=""
              className={`${styles.accordionChevron} ${openAccordion === "details" ? styles.accordionChevronOpen : ""}`}
            />
          </button>
          {openAccordion === "details" && (
            <div className={styles.accordionBody}>
              <p>Référence : {product.reference}</p>
              {product.variants.length > 0 && (
                <p>{product.variants.length} variante(s) disponible(s)</p>
              )}
            </div>
          )}
        </div>

        <div className={styles.accordion}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => toggleAccordion("info")}
            aria-expanded={openAccordion === "info"}
          >
            <span>Plus d&apos;information</span>
            <img
              src="/icon/product-detail/chevron-down.svg"
              alt=""
              className={`${styles.accordionChevron} ${openAccordion === "info" ? styles.accordionChevronOpen : ""}`}
            />
          </button>
          {openAccordion === "info" && (
            <div className={styles.accordionBody}>
              <p>Marque : {product.brand?.name ?? "—"}</p>
              <p>Retours acceptés sous 7 jours, produit non utilisé et dans son emballage d&apos;origine.</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.reviews}>
        <h2 className={styles.reviewsTitle}>Quel est votre niveau de satisfaction ?</h2>
        <div className={styles.moods}>
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${styles.moodButton} ${mood === m.id ? styles.moodButtonActive : ""}`}
              onClick={() => setMood(m.id)}
              aria-pressed={mood === m.id}
            >
              <img src={m.icon} alt="" className={styles.moodIcon} />
              <span className={styles.moodLabel}>{m.label}</span>
            </button>
          ))}
        </div>

        <h2 className={styles.reviewsTitle}>
          Laissez un commentaire <span className={styles.optional}>(Facultatif)</span>
        </h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Votre avis nous intéresse..."
          className={styles.commentInput}
        />

        <div className={styles.reviewActions}>
          <button type="button" className={styles.cancelButton} onClick={() => { setMood(null); setComment(""); }}>
            Annuler
          </button>
          <button type="button" className={styles.submitButton}>
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
}
