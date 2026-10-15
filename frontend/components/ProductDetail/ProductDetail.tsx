"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  addCartItem,
  ApiValidationError,
  getCities,
  getDeliveryEstimate,
  getNeighborhoods,
  submitReview,
  trackProductView,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import { WhatsAppIcon, WHATSAPP_NUMBER } from "@/components/WhatsAppButton/WhatsAppButton";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { savePendingCartIntent } from "@/lib/pendingCartIntent";
import { getDisplayVariant } from "@/lib/pricing";
import { getViewSessionToken, recordRecentlyViewed } from "@/lib/productView";
import type { City, Neighborhood, Product, Review } from "@/lib/types";
import styles from "./ProductDetail.module.css";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

const FEATURE_ICONS = [
  "/icon/product-detail/feature-delivery.png",
  "/icon/product-detail/feature-payment.png",
  "/icon/product-detail/feature-support.png",
  "/icon/product-detail/feature-prime.svg",
];

// rating maps each mood onto the backend's 1-5 scale (StoreReviewRequest).
const MOOD_DEFS = [
  { id: "very-dissatisfied", icon: "/icon/product-detail/mood-very-dissatisfied.svg", key: "veryDissatisfied", rating: 1 },
  { id: "worried", icon: "/icon/product-detail/mood-worried.svg", key: "worried", rating: 2 },
  { id: "content", icon: "/icon/product-detail/mood-content.svg", key: "content", rating: 3 },
  { id: "calm", icon: "/icon/product-detail/mood-calm.svg", key: "calm", rating: 4 },
  { id: "happy", icon: "/icon/product-detail/mood-happy.svg", key: "happy", rating: 5 },
] as const;

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

interface ProductDetailProps {
  product: Product;
  /** Already-approved reviews only (see ReviewController::index). */
  reviews: Review[];
}

// Figma: desktop node 975:5613, mobile node 223:189. The delivery box,
// feature badges and the two accordions only exist in the desktop design —
// mobile stops at description + buy button + reviews (see .module.css).

export default function ProductDetail({ product, reviews }: ProductDetailProps) {
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
        : [{ id: 0, image_url: PLACEHOLDER_IMAGE, is_primary: true, alt_text: null, product_variant_id: null }];
  // Show exactly however many photos this product/variant actually has —
  // no padding, no truncating. baseImages already falls back to a single
  // placeholder slot when there are none at all.
  const images = baseImages;
  const [activeImage, setActiveImage] = useState(0);
  // next/image needs a stable src per <Image> — imperatively mutating the
  // DOM node's src (the old <img onError> pattern) fights React's own
  // re-renders here, so failures are tracked in state instead, keyed by
  // each image's own (real, backend) id.
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(new Set());
  const trackRef = useRef<HTMLDivElement>(null);
  const buyRowRef = useRef<HTMLDivElement>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);
  const [locationListsStatus, setLocationListsStatus] = useState<"loading" | "ready" | "error">("loading");
  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");
  const [pickup, setPickup] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<"details" | "specs" | "info" | null>(null);
  const [mood, setMood] = useState<(typeof MOODS)[number]["id"] | null>(null);
  const [comment, setComment] = useState("");
  const [addStatus, setAddStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [addMessage, setAddMessage] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  // Starts false (matches server render — getSession() reads localStorage,
  // which doesn't exist during SSR) and is corrected right after mount, same
  // fix as CheckoutContext's orderNumber: seeding this from getSession()
  // directly in useState would make the very first client render disagree
  // with the server-rendered HTML.
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => setLoggedIn(Boolean(getSession())), []);

  // Feeds "Récemment consultés" (this shopper's own history, localStorage)
  // and "Les clients ont aussi consulté" (cross-shopper correlation, see
  // ProductController::alsoViewed()) — fire-and-forget, never blocks
  // rendering and a failure here isn't worth surfacing to the shopper.
  useEffect(() => {
    recordRecentlyViewed(product.id);
    trackProductView(product.id, getViewSessionToken()).catch(() => {});
  }, [product.id]);

  // Desktop opens straight into the ad banner + gallery, with the buy
  // button a full page further down (name, meta, price, variants,
  // description...) — a shopper had to scroll themselves just to see it.
  // Jumping there automatically on load removes that extra step. Desktop
  // only (901px — this component's own breakpoint, see .module.css) per
  // what was asked for: mobile's layout and quick-add button already put
  // purchasing within easy reach without this.
  //
  // behavior: "instant", not "smooth" — tested both against the real page
  // (not just this element in isolation): a smooth scroll takes a few
  // hundred ms to animate, and anything that shifts layout during that
  // window (images below settling into their final size, other sections
  // further down hydrating) reliably cancelled it partway, leaving the
  // button no closer to view than before. An instant jump completes in one
  // frame, before anything else has a chance to interrupt it.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 901px)").matches) return;
    const timer = window.setTimeout(() => {
      buyRowRef.current?.scrollIntoView({ behavior: "instant", block: "center" });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [product.id]);
  // A long description used to push the buy button far down the page —
  // clamped to a few lines by default, expandable on demand, so the layout
  // stays predictable regardless of how much the admin writes.
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Stock is tracked per variant, not per product (a product can be
  // in-stock overall while the specific variant picked is sold out, or vice
  // versa) — reflect whichever the shopper actually has selected.
  const effectiveStock = selectedVariant ? (selectedVariant.stock_quantity ?? 0) : (product.stock_quantity ?? 0);
  const inStock = effectiveStock > 0;
  const effectivePrice = selectedVariant?.price ?? product.price_from;

  // A pre-filled message so the shop owner knows what's being ordered
  // without the shopper having to type it themselves — wa.me opens the
  // chat with this already in the input, still editable before sending.
  const whatsappOrderUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    dict.product.whatsappOrderMessage(
      product.name,
      effectivePrice !== null ? formatPrice(effectivePrice) : dict.common.priceUnavailable
    )
  )}`;

  // Cart routes require auth (API.md §4) — a guest is sent to sign in rather
  // than silently failing. Used by both buttons in .buyRow: the icon-only
  // one just adds and stays on the page, "Acheter (maintenant)" adds then
  // takes the shopper straight to their cart.
  async function handleAddToCart(goToCart: boolean) {
    const session = getSession();
    if (!session) {
      savePendingCartIntent({
        type: "add-to-cart",
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity: 1,
        goToCart,
        returnPath: window.location.pathname,
      });
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

  // Reviews work without an account on purpose — requiring a login here
  // would just turn a visitor away instead of getting their feedback. The
  // submit button was previously wired to nothing at all — this is what
  // actually posts to ReviewController::store.
  async function handleSubmitReview() {
    if (!mood) {
      setReviewStatus("error");
      setReviewMessage(dict.product.ratingRequired);
      return;
    }

    const session = getSession();
    if (!session && !guestName.trim()) {
      setReviewStatus("error");
      setReviewMessage(dict.product.guestNameRequired);
      return;
    }

    const rating = MOODS.find((m) => m.id === mood)?.rating ?? 3;

    setReviewStatus("submitting");
    setReviewMessage(null);
    try {
      await submitReview(
        product.id,
        { rating, comment: comment.trim() || undefined, guestName: session ? undefined : guestName.trim() },
        session?.token ?? null
      );
      setReviewStatus("submitted");
      setReviewMessage(dict.product.reviewSubmitted);
      setMood(null);
      setComment("");
      setGuestName("");
    } catch (err) {
      setReviewStatus("error");
      setReviewMessage(
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.product.genericError
      );
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

  function toggleAccordion(name: "details" | "specs" | "info") {
    setOpenAccordion((current) => (current === name ? null : name));
  }

  // "Spécifications" — assembled from fields that already exist (no new
  // admin-managed content type yet), one row per piece of data that's
  // actually present. Rows collapse away entirely rather than showing "—"
  // for a product/category that doesn't have that attribute.
  const specRows: { label: string; value: string }[] = [];
  if (product.reference) specRows.push({ label: dict.product.specReference, value: product.reference });
  if (product.categories && product.categories.length > 0) {
    specRows.push({
      label: dict.product.specCategory,
      value: product.categories.map((c) => c.name).join(", "),
    });
  }
  if (product.brand?.name) specRows.push({ label: dict.product.specBrand, value: product.brand.name });
  if (product.brand?.country_origin) {
    specRows.push({ label: dict.product.specOrigin, value: product.brand.country_origin });
  }
  for (const [label, field] of [
    [dict.product.specColors, "color"],
    [dict.product.specSizes, "size"],
    [dict.product.specMaterial, "material"],
  ] as const) {
    const values = [...new Set(product.variants.map((v) => v[field]).filter((v): v is string => Boolean(v)))];
    if (values.length > 0) specRows.push({ label, value: values.join(", ") });
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
                    alt={image.alt_text || product.name}
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
                <span className={styles.metaValue}>
                  {product.categories && product.categories.length > 0
                    ? product.categories.map((c) => c.name).join(", ")
                    : "—"}
                </span>
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
                <p
                  className={`${styles.description} ${!descriptionExpanded ? styles.descriptionClamped : ""}`}
                >
                  {product.description ?? dict.product.noDescription}
                </p>
                {/* Rough length check, not an exact line count — cheap and
                    good enough: short descriptions never show the toggle,
                    long ones always do (the clamp CSS is what actually
                    limits it to a few lines either way). */}
                {product.description && product.description.length > 220 && (
                  <button
                    type="button"
                    className={styles.descriptionToggle}
                    onClick={() => setDescriptionExpanded((v) => !v)}
                  >
                    {descriptionExpanded ? dict.product.readLess : dict.product.readMore}
                  </button>
                )}
              </div>

              <div className={styles.buyRow} ref={buyRowRef}>
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

                {/* At rest: a small circle, just the icon (see .whatsappButton
                    in the stylesheet — flex-basis pins it to 58px). On hover,
                    it and .buyButton swap flex-basis (a shared `transition:
                    flex` on both), so this expands into the full label while
                    .buyButton shrinks to icon-only — pure CSS, driven by
                    .buyRow:has(.whatsappButton:hover). */}
                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappButton}
                  aria-label={dict.product.orderViaWhatsapp}
                >
                  <WhatsAppIcon className={styles.whatsappIcon} />
                  <span className={styles.whatsappLabel}>{dict.product.orderViaWhatsapp}</span>
                </a>

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

      {/* .accordions (below) is desktop-only by design — mobile's Figma
          source never included "Détails du produit"/"Plus d'information"
          (see the component's top comment). Specs are new and genuinely
          wanted on mobile too, so this one lives outside that wrapper with
          its own always-visible styling instead of inheriting that
          desktop-only rule. */}
      {specRows.length > 0 && (
        <div className={styles.specsSection}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => toggleAccordion("specs")}
            aria-expanded={openAccordion === "specs"}
          >
            <span>{dict.product.specifications}</span>
            <img
              src="/icon/product-detail/chevron-down.svg"
              alt=""
              className={`${styles.accordionChevron} ${openAccordion === "specs" ? styles.accordionChevronOpen : ""}`}
            />
          </button>
          {openAccordion === "specs" && (
            <div className={styles.accordionBody}>
              <dl className={styles.specList}>
                {specRows.map((row) => (
                  <div className={styles.specRow} key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}

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
                {dict.product.brand}{" "}
                {product.brand ? (
                  <LocaleLink href={`/marques/${product.brand.slug}`} className={styles.brandLink}>
                    {product.brand.name}
                  </LocaleLink>
                ) : (
                  "—"
                )}
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
              onClick={() => {
                setMood(m.id);
                if (reviewStatus === "error") {
                  setReviewStatus("idle");
                  setReviewMessage(null);
                }
              }}
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

        {!loggedIn && (
          <>
            <h2 className={styles.reviewsTitle}>{dict.product.yourName}</h2>
            <input
              type="text"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (reviewStatus === "error") {
                  setReviewStatus("idle");
                  setReviewMessage(null);
                }
              }}
              placeholder={dict.product.yourNamePlaceholder}
              className={styles.nameInput}
            />
          </>
        )}

        <div className={styles.reviewActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => {
              setMood(null);
              setComment("");
              setReviewStatus("idle");
              setReviewMessage(null);
            }}
          >
            {dict.product.cancel}
          </button>
          <button
            type="button"
            className={styles.submitButton}
            disabled={reviewStatus === "submitting"}
            onClick={handleSubmitReview}
          >
            {reviewStatus === "submitting" ? dict.product.submittingReview : dict.product.submit}
          </button>
        </div>

        {reviewMessage && (
          <p className={reviewStatus === "error" ? styles.reviewFeedbackError : styles.reviewFeedbackSuccess}>
            {reviewMessage}
          </p>
        )}

        <h2 className={styles.reviewsTitle}>{dict.product.reviewsListTitle(reviews.length)}</h2>
        {reviews.length === 0 ? (
          <p className={styles.noReviews}>{dict.product.noReviews}</p>
        ) : (
          <ul className={styles.reviewList}>
            {reviews.map((review) => (
              <li key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewItemHeader}>
                  <span className={styles.reviewAuthor}>
                    {review.user?.name ?? review.guest_name ?? dict.product.anonymousReviewer}
                  </span>
                  <span className={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
                <span className={styles.reviewMoodLabel}>
                  {MOODS.find((m) => m.rating === review.rating)?.label ?? `${review.rating}/5`}
                </span>
                {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
