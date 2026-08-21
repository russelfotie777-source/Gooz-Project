"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { addCartItem, ApiValidationError, getCities, getDeliveryEstimate, getNeighborhoods } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { getDisplayVariant } from "@/lib/pricing";
import type { City, Neighborhood, Product } from "@/lib/types";
import styles from "./ProductDetail.module.css";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

const FEATURE_ICONS = [
  "/icon/product-detail/feature-delivery.png",
  "/icon/product-detail/feature-payment.png",
  "/icon/product-detail/feature-support.png",
  "/icon/product-detail/feature-prime.svg",
];

const MOOD_DEFS = [
  { id: "very-dissatisfied", icon: "/icon/product-detail/mood-very-dissatisfied.svg", key: "veryDissatisfied" },
  { id: "worried", icon: "/icon/product-detail/mood-worried.svg", key: "worried" },
  { id: "content", icon: "/icon/product-detail/mood-content.svg", key: "content" },
  { id: "calm", icon: "/icon/product-detail/mood-calm.svg", key: "calm" },
  { id: "happy", icon: "/icon/product-detail/mood-happy.svg", key: "happy" },
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
  const dict = useDictionary();
  const router = useLocaleRouter();
  const FEATURES = dict.product.features.map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] }));
  const MOODS = MOOD_DEFS.map((m) => ({ ...m, label: dict.product.moods[m.key] }));
  // Defaults to the cheapest variant (same as the price shown on the
  // catalogue card the shopper clicked through from), but — unlike before —
  // this is now just the initial pick: selectVariant lets them change it
  // before adding to cart, instead of silently shipping whatever's cheapest.
  const [selectedVariantId, setSelectedVariantId] = useState(() => getDisplayVariant(product)?.id ?? null);
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null;
  // ProductImage.product_variant_id exists precisely for this — a variant
  // with its own photos (e.g. a different color) should show those, not the
  // product's generic/first-variant set left over from the initial pick.
  const baseImages =
    selectedVariant && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.images.length > 0
        ? product.images
        : [{ id: 0, image_url: PLACEHOLDER_IMAGE, is_primary: true, product_variant_id: null }];
  // Real products will eventually have several angles; pad with the same
  // image for now so the thumbnail rail/dots always show their full slots.
  const images = Array.from({ length: GALLERY_SIZE }, (_, i) => ({
    ...baseImages[i % baseImages.length],
    id: i,
  }));
  const [activeImage, setActiveImage] = useState(0);
  // next/image needs a stable src per <Image> — imperatively mutating the
  // DOM node's src (the old <img onError> pattern) fights React's own
  // re-renders here, so failures are tracked in state instead, keyed by the
  // gallery slot's id (0..GALLERY_SIZE-1).
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(new Set());
  const trackRef = useRef<HTMLDivElement>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);
  const [locationListsStatus, setLocationListsStatus] = useState<"loading" | "ready" | "error">("loading");
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

  // Stock is tracked per variant, not per product (a product can be
  // in-stock overall while the specific variant picked is sold out, or vice
  // versa) — reflect whichever the shopper actually has selected.
  const effectiveStock = selectedVariant ? (selectedVariant.stock_quantity ?? 0) : (product.stock_quantity ?? 0);
  const inStock = effectiveStock > 0;
  const effectivePrice = selectedVariant?.price ?? product.price_from;

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
      const cart = await addCartItem(session.token, product.id, 1, selectedVariant?.id);
      notifyCartUpdated(cart.items.length);
      if (goToCart) {
        router.push("/cart");
        return;
      }
      setAddStatus("added");
      setAddMessage(dict.product.addedToCartMessage);
      window.setTimeout(() => setAddStatus("idle"), 1800);
    } catch (err) {
      setAddStatus("error");
      setAddMessage(
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.product.genericError
      );
      window.setTimeout(() => setAddStatus("idle"), 2500);
    }
  }

  // Fetched once, up front: the neighborhoods list stays tiny (a handful per
  // city), so filtering client-side on city change avoids an extra network
  // round-trip every time the user picks a city.
  function loadLocationLists() {
    setLocationListsStatus("loading");
    Promise.all([getCities(), getNeighborhoods()])
      .then(([citiesData, neighborhoodsData]) => {
        setCities(citiesData);
        setAllNeighborhoods(neighborhoodsData);
        setLocationListsStatus("ready");
      })
      // An empty [] here used to be indistinguishable from "there really are
      // no cities" — the shopper saw an empty dropdown either way, with no
      // way to tell a real gap in the data from a failed fetch worth retrying.
      .catch(() => setLocationListsStatus("error"));
  }

  useEffect(loadLocationLists, []);

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

  // The gallery's contents just changed under it (see baseImages above) —
  // jump back to the first photo instead of leaving activeImage pointing at
  // whatever slide the shopper happened to be on for the previous variant.
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
    setActiveImage(0);
    setFailedImageIds(new Set());
  }, [selectedVariantId]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.topRow}>
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            <div className={styles.swipeTrack} ref={trackRef} onScroll={handleTrackScroll}>
              {images.map((image) => (
                <div className={styles.swipeSlide} key={image.id}>
                  <Image
                    src={failedImageIds.has(image.id) ? PLACEHOLDER_IMAGE : (image.image_url ?? PLACEHOLDER_IMAGE)}
                    alt={product.name}
                    className={styles.mainImage}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    priority={image.id === 0}
                    onError={() => setFailedImageIds((prev) => new Set(prev).add(image.id))}
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
                  aria-label={dict.product.viewImage(index + 1)}
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
                aria-label={dict.product.viewImage(index + 1)}
              >
                <Image
                  src={failedImageIds.has(image.id) ? PLACEHOLDER_IMAGE : (image.image_url ?? PLACEHOLDER_IMAGE)}
                  alt=""
                  className={styles.thumbnailImage}
                  fill
                  sizes="90px"
                  onError={() => setFailedImageIds((prev) => new Set(prev).add(image.id))}
                />
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
                  {inStock ? dict.product.inStock : dict.product.outOfStock}
                </span>

                <span className={styles.rating} aria-label={dict.product.productRating}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <img key={i} src="/icon/product-detail/star.svg" alt="" className={styles.star} />
                  ))}
                </span>
              </div>

              <div className={styles.metaLine}>
                <span className={styles.metaLabel}>{dict.product.category}</span>
                <span className={styles.metaValue}>{product.category?.name ?? "—"}</span>
              </div>
              <div className={styles.metaLine}>
                <span className={styles.metaLabel}>{dict.product.origin}</span>
                <span className={styles.metaValue}>{product.brand?.country_origin ?? "—"}</span>
              </div>

              <p className={styles.price}>
                {effectivePrice !== null ? formatPrice(effectivePrice) : dict.common.priceUnavailable}
                {selectedVariant?.is_promotion && selectedVariant.promo_price && (
                  <span className={styles.specialPriceTag}>{dict.product.specialPrice}</span>
                )}
              </p>

              {product.variants.length > 1 && (
                <div className={styles.variantRow} role="group" aria-label={dict.product.chooseVariant}>
                  {product.variants.map((variant) => {
                    const label =
                      variant.display_name ??
                      [variant.size, variant.color, variant.material].filter(Boolean).join(" · ") ??
                      dict.product.variantFallbackLabel(variant.id);
                    const variantOutOfStock = (variant.stock_quantity ?? 0) <= 0;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        className={`${styles.variantButton} ${
                          variant.id === selectedVariantId ? styles.variantButtonActive : ""
                        } ${variantOutOfStock ? styles.variantButtonOutOfStock : ""}`}
                        aria-pressed={variant.id === selectedVariantId}
                        disabled={variantOutOfStock}
                        onClick={() => setSelectedVariantId(variant.id)}
                      >
                        {label}
                        {variantOutOfStock && (
                          <span className={styles.variantOutOfStockTag}>{dict.product.outOfStock}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className={styles.descriptionBlock}>
                <h2 className={styles.descriptionTitle}>{dict.product.aboutProduct}</h2>
                <p className={styles.description}>
                  {product.description ?? dict.product.noDescription}
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
                  <span className={styles.buyButtonLabelDesktop}>{dict.product.buyNow}</span>
                  <span className={styles.buyButtonLabelMobile}>{dict.product.buyNowMobile}</span>
                </button>

                <button
                  type="button"
                  className={styles.quickAddButton}
                  aria-label={dict.common.addToCart}
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
                {dict.product.deliveryPrompt}
              </p>

              {locationListsStatus === "error" && (
                <p className={styles.locationListsError}>
                  {dict.product.locationListsError}{" "}
                  <button type="button" className={styles.locationListsRetry} onClick={loadLocationLists}>
                    {dict.product.locationListsRetry}
                  </button>
                </p>
              )}

              <label className={styles.selectField}>
                <select value={cityId} onChange={(e) => setCityId(e.target.value)} className={styles.select}>
                  <option value="">{dict.product.selectCity}</option>
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
                  <option value="">{dict.product.selectNeighborhood}</option>
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
                <img src="/icon/product-detail/chevron-down.svg" alt="" className={styles.selectChevron} />
              </label>

              <div className={styles.deliveryCost}>
                <span>{dict.product.cost}</span>
                <span className={styles.deliveryCostValue}>
                  {pickup
                    ? formatPrice(0)
                    : deliveryStatus === "loading"
                      ? dict.product.calculating
                      : deliveryStatus === "error"
                        ? dict.product.unavailable
                        : deliveryFee !== null
                          ? formatPrice(deliveryFee)
                          : dict.product.calculatedAtDelivery}
                </span>
              </div>

              <div className={styles.orDivider}>
                <span className={styles.orLine} />
                <span>{dict.product.or}</span>
                <span className={styles.orLine} />
              </div>

              <button
                type="button"
                className={`${styles.pickupButton} ${pickup ? styles.pickupButtonActive : ""}`}
                onClick={() => setPickup((v) => !v)}
              >
                <span className={styles.pickupLabel}>{dict.product.pickupAtStore}</span>
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
            <span>{dict.product.productDetails}</span>
            <img
              src="/icon/product-detail/chevron-down.svg"
              alt=""
              className={`${styles.accordionChevron} ${openAccordion === "details" ? styles.accordionChevronOpen : ""}`}
            />
          </button>
          {openAccordion === "details" && (
            <div className={styles.accordionBody}>
              <p>
                {dict.product.reference} {product.reference}
              </p>
              {product.variants.length > 0 && (
                <p>{dict.product.variantsAvailable(product.variants.length)}</p>
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
            <span>{dict.product.moreInfo}</span>
            <img
              src="/icon/product-detail/chevron-down.svg"
              alt=""
              className={`${styles.accordionChevron} ${openAccordion === "info" ? styles.accordionChevronOpen : ""}`}
            />
          </button>
          {openAccordion === "info" && (
            <div className={styles.accordionBody}>
              <p>
                {dict.product.brand} {product.brand?.name ?? "—"}
              </p>
              <p>{dict.product.returnsPolicy}</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.reviews}>
        <h2 className={styles.reviewsTitle}>{dict.product.satisfactionTitle}</h2>
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
          {dict.product.leaveComment} <span className={styles.optional}>{dict.product.optional}</span>
        </h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={dict.product.commentPlaceholder}
          className={styles.commentInput}
        />

        <div className={styles.reviewActions}>
          <button type="button" className={styles.cancelButton} onClick={() => { setMood(null); setComment(""); }}>
            {dict.product.cancel}
          </button>
          <button type="button" className={styles.submitButton}>
            {dict.product.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
