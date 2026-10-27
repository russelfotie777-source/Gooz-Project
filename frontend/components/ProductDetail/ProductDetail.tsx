"use client";

import { useEffect, useRef, useState } from "react";
import { addCartItem, ApiValidationError, trackProductView } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import { WhatsAppIcon, WHATSAPP_NUMBER } from "@/components/WhatsAppButton/WhatsAppButton";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { savePendingCartIntent } from "@/lib/pendingCartIntent";
import { formatPrice, getDisplayVariant } from "@/lib/pricing";
import { productPath } from "@/lib/productUrl";
import { getViewSessionToken, recordRecentlyViewed } from "@/lib/productView";
import { localizedPath } from "@/lib/seo";
import { SITE_URL } from "@/lib/siteUrl";
import type { Product, Review } from "@/lib/types";
import DeliveryEstimator from "./DeliveryEstimator";
import ProductGallery from "./ProductGallery";
import ReviewForm from "./ReviewForm";
import styles from "./ProductDetail.module.css";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

const FEATURE_ICONS = [
  "/icon/product-detail/feature-delivery.png",
  "/icon/product-detail/feature-payment.png",
  "/icon/product-detail/feature-support.png",
  "/icon/product-detail/feature-prime.svg",
];

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
  const lang = useLang();
  const router = useLocaleRouter();
  const FEATURES = dict.product.features.map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] }));
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
        : [
            {
              id: 0,
              image_url: PLACEHOLDER_IMAGE,
              thumbnail_url: null,
              is_primary: true,
              alt_text: null,
              product_variant_id: null,
            },
          ];
  // Show exactly however many photos this product/variant actually has —
  // no padding, no truncating. baseImages already falls back to a single
  // placeholder slot when there are none at all.
  const images = baseImages;
  const buyRowRef = useRef<HTMLDivElement>(null);
  const [openAccordion, setOpenAccordion] = useState<"details" | "specs" | "info" | null>(null);
  const [addStatus, setAddStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [addMessage, setAddMessage] = useState<string | null>(null);

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
  // Includes the product's own absolute URL so the shop owner can open it
  // directly instead of having to search for the product by name.
  const productUrl = `${SITE_URL}${localizedPath(lang, productPath(product).replace(/^\//, ""))}`;
  const whatsappOrderUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    dict.product.whatsappOrderMessage(
      product.name,
      effectivePrice !== null ? formatPrice(effectivePrice) : dict.common.priceUnavailable,
      productUrl
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

  function toggleAccordion(name: "details" | "specs" | "info") {
    setOpenAccordion((current) => (current === name ? null : name));
  }

  // "Spécifications" — admin-authored label/value rows (set from the
  // admin product form, see ProductSpecification) take over entirely once
  // any are set. A product nobody has edited yet (specifications: [])
  // falls back to the old auto-recombined list below, so existing
  // products don't suddenly show an empty section.
  const specRows: { label: string; value: string }[] =
    product.specifications.length > 0 ? product.specifications : [];

  if (specRows.length === 0) {
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
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topRow}>
        <ProductGallery images={images} productName={product.name} resetKey={selectedVariantId} />

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

            <DeliveryEstimator />
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
              {product.product_details ? (
                product.product_details.split("\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : (
                <>
                  <p>
                    {dict.product.reference} {product.reference}
                  </p>
                  {product.variants.length > 0 && (
                    <p>{dict.product.variantsAvailable(product.variants.length)}</p>
                  )}
                </>
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
              {product.more_info ? (
                product.more_info.split("\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ReviewForm productId={product.id} reviews={reviews} />
    </div>
  );
}
