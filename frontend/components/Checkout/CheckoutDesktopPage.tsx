"use client";

import { useState } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useCheckout } from "./CheckoutContext";
import CheckoutConfirmationVerified from "./CheckoutConfirmationVerified";
import CheckoutRedirectingContent from "./CheckoutRedirectingContent";
import styles from "./CheckoutDesktopPage.module.css";

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

type Step = 1 | 2 | 3;

// Figma desktop node 1669:2379 (step 1), 1679:3412 (step 2), 1680:3770
// (step 3) — one page, an accordion of 3 steps that unlock in sequence,
// unlike the mobile flow's 4 separate routes. Reuses the same
// CheckoutContext as mobile (form/delivery/payment/totals + the real
// delivery-fee API call) so both platforms share one source of truth.
export default function CheckoutDesktopPage() {
  const dict = useDictionary();
  const {
    cartStatus,
    retryLoad,
    items,
    subtotal,
    cities,
    neighborhoods: allNeighborhoods,
    warehouse,
    form,
    setForm,
    isAddressComplete,
    deliveryMethod,
    setDeliveryMethod,
    deliveryFee,
    deliveryStatus,
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

  const [activeStep, setActiveStep] = useState<Step>(1);
  const [maxStepReached, setMaxStepReached] = useState<Step>(1);
  const [whatsappSecondary, setWhatsappSecondary] = useState("");
  const [couponOpen, setCouponOpen] = useState(true);
  const [placing, setPlacing] = useState(false);

  const neighborhoods = form.cityId ? allNeighborhoods.filter((n) => n.city_id === Number(form.cityId)) : [];
  const cityName = cities.find((c) => String(c.id) === form.cityId)?.name ?? "";
  const neighborhoodName = allNeighborhoods.find((n) => String(n.id) === form.neighborhoodId)?.name ?? "";
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const livraisonFee = deliveryMethod === "domicile" ? deliveryFee : 0;

  const step1Done = maxStepReached >= 2;
  const step2Done = maxStepReached >= 3;
  const canPlaceOrder = step1Done && step2Done && Boolean(paymentMethod) && !placing;

  async function handlePlaceOrder() {
    if (!canPlaceOrder) return;
    setPlacing(true);
    try {
      await placeOrder();
    } catch {
      setPlacing(false);
    }
  }

  function handleSaveAddress() {
    if (!isAddressComplete) return;
    setMaxStepReached(2);
    setActiveStep(2);
  }

  function handleValidateDelivery() {
    if (!deliveryMethod) return;
    setMaxStepReached(3);
    setActiveStep(3);
  }

  // Mobile money orders get a checkoutUrl: show a brief interstitial before
  // sending the browser to Enkap's hosted payment page — an instant jump to
  // a third-party domain with no explanation reads as suspicious. Checked
  // before the plain success screen below since checkoutUrl implies the
  // order isn't actually confirmed yet, just created.
  if (orderNumber && checkoutUrl) {
    return (
      <div className={styles.page}>
        <Header cartCount={items.length} />
        <main className={styles.successMain}>
          <CheckoutRedirectingContent checkoutUrl={checkoutUrl} />
        </main>
        <Footer />
      </div>
    );
  }

  if (orderNumber && !checkoutUrl) {
    // Same reasoning as the mobile /checkout/confirmation/[reference] route:
    // orderNumber here comes from sessionStorage (see CheckoutContext), not
    // a URL a stranger could edit, but re-verifying it against the backend
    // before showing "your order is confirmed" keeps both platforms honest
    // about the same thing rather than trusting local state on one of them.
    return (
      <div className={styles.page}>
        <Header cartCount={items.length} />
        <main className={styles.successMain}>
          <CheckoutConfirmationVerified reference={orderNumber} />
        </main>
        <Footer />
      </div>
    );
  }

  // The real /checkout endpoint requires auth (API.md §6), same gate as the
  // mobile shell (CheckoutMobileShell).
  if (cartStatus !== "ready") {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.gateMain}>
          {cartStatus === "loading" && <p>{dict.checkout.loading}</p>}
          {cartStatus === "loggedOut" && (
            <>
              <p>{dict.checkout.loginPrompt}</p>
              <LocaleLink href="/connexion" className={styles.gateLink}>
                {dict.checkout.login}
              </LocaleLink>
            </>
          )}
          {cartStatus === "empty" && (
            <>
              <p>{dict.checkout.emptyCart}</p>
              <LocaleLink href="/cart" className={styles.gateLink}>
                {dict.checkout.viewCart}
              </LocaleLink>
            </>
          )}
          {cartStatus === "error" && (
            <>
              <p>{dict.checkout.loadError}</p>
              <button type="button" className={styles.gateLink} onClick={retryLoad}>
                {dict.checkout.retry}
              </button>
            </>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header cartCount={items.length} />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>{dict.checkout.finalizeOrderTitle}</h1>
          <h2 className={styles.summaryTitle}>{dict.checkout.orderSummaryTitle}</h2>
        </div>

        <div className={styles.layout}>
          <div className={styles.steps}>
            {/* Step 1 — Adresse de livraison */}
            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepHeaderLeft}>
                  {step1Done ? (
                    <span className={styles.stepCheck}>
                      <img src="/icon/checkout/check-green.svg" alt="" className={styles.stepCheckIcon} />
                    </span>
                  ) : (
                    <span className={styles.stepNumber}>1</span>
                  )}
                  <h3 className={step1Done ? styles.stepTitleDone : styles.stepTitle}>{dict.checkout.addressTitle}</h3>
                </div>
                {step1Done && activeStep !== 1 && (
                  <button type="button" className={styles.modifyButton} onClick={() => setActiveStep(1)}>
                    <img src="/icon/checkout/pen.svg" alt="" className={styles.modifyIcon} />
                    {dict.checkout.modify}
                  </button>
                )}
              </div>

              {activeStep === 1 && (
                <div className={styles.stepBody}>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span className={styles.label}>
                        <span className={styles.required}>*</span>{dict.checkout.nom}
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-user.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="text"
                          value={form.nom}
                          onChange={(e) => setForm({ nom: e.target.value })}
                          placeholder={dict.checkout.namePlaceholder}
                          className={styles.input}
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>
                        <span className={styles.required}>*</span>{dict.checkout.prenom}
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-user.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="text"
                          value={form.prenom}
                          onChange={(e) => setForm({ prenom: e.target.value })}
                          placeholder={dict.checkout.surnamePlaceholder}
                          className={styles.input}
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>
                        <span className={styles.required}>*</span>{dict.checkout.phoneLabel}
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-phone.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="tel"
                          value={form.telephone}
                          onChange={(e) => setForm({ telephone: e.target.value })}
                          placeholder={dict.checkout.phonePlaceholder}
                          className={styles.input}
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>{dict.checkout.emailOptionalLabel}</span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-mail.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ email: e.target.value })}
                          placeholder={dict.checkout.emailPlaceholder}
                          className={styles.input}
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>
                        <span className={styles.required}>*</span>{dict.checkout.villeLabel}
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-address.svg" alt="" className={styles.inputIcon} />
                        <select
                          value={form.cityId}
                          onChange={(e) => setForm({ cityId: e.target.value, neighborhoodId: "" })}
                          className={styles.select}
                        >
                          <option value="">{dict.checkout.selectVille}</option>
                          {cities.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>
                        <span className={styles.required}>*</span>{dict.checkout.quartierLabel}
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-address.svg" alt="" className={styles.inputIcon} />
                        <select
                          value={form.neighborhoodId}
                          onChange={(e) => setForm({ neighborhoodId: e.target.value })}
                          disabled={!form.cityId}
                          className={styles.select}
                        >
                          <option value="">{dict.checkout.selectQuartier}</option>
                          {neighborhoods.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>
                        <span className={styles.required}>*</span>{dict.checkout.addressLabel}
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-address.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="text"
                          value={form.adresse}
                          onChange={(e) => setForm({ adresse: e.target.value })}
                          placeholder={dict.checkout.addressPlaceholder}
                          className={styles.input}
                        />
                      </div>
                    </label>
                  </div>

                  <p className={styles.subheading}>{dict.checkout.otherInfoOptional}</p>

                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span className={styles.label}>{dict.checkout.whatsappContactLabel}</span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-whatsapp.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="tel"
                          value={form.whatsapp}
                          onChange={(e) => setForm({ whatsapp: e.target.value })}
                          placeholder={dict.checkout.whatsappPlaceholder}
                          className={styles.input}
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>{dict.checkout.secondaryPhoneLabel}</span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-phone.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="tel"
                          value={whatsappSecondary}
                          onChange={(e) => setWhatsappSecondary(e.target.value)}
                          placeholder={dict.checkout.phonePlaceholder}
                          className={styles.input}
                        />
                      </div>
                    </label>
                  </div>

                  <p className={styles.note}>
                    <strong>{dict.checkout.requiredNoteLabel}</strong> {dict.checkout.requiredNoteText}
                  </p>

                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={!isAddressComplete}
                    onClick={handleSaveAddress}
                  >
                    {dict.checkout.saveContinue}
                  </button>
                </div>
              )}

              {step1Done && activeStep !== 1 && (
                <div className={styles.stepSummary}>
                  <span>
                    {form.nom} {form.prenom}
                  </span>
                  <span>
                    {cityName}
                    {neighborhoodName ? `, ${neighborhoodName}` : ""}
                  </span>
                  <span>{form.telephone}</span>
                </div>
              )}
            </div>

            {/* Step 2 — Méthode de livraison */}
            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepHeaderLeft}>
                  {step2Done ? (
                    <span className={styles.stepCheck}>
                      <img src="/icon/checkout/check-green.svg" alt="" className={styles.stepCheckIcon} />
                    </span>
                  ) : (
                    <span className={`${styles.stepNumber} ${!step1Done ? styles.stepNumberLocked : ""}`}>2</span>
                  )}
                  <h3 className={step2Done ? styles.stepTitleDone : styles.stepTitle}>{dict.checkout.deliveryStepTitle}</h3>
                </div>
                {!step1Done && <img src="/icon/checkout/lock.svg" alt="" className={styles.lockIcon} />}
                {step2Done && activeStep !== 2 && (
                  <button type="button" className={styles.modifyButton} onClick={() => setActiveStep(2)}>
                    <img src="/icon/checkout/pen.svg" alt="" className={styles.modifyIcon} />
                    {dict.checkout.modify}
                  </button>
                )}
              </div>

              {activeStep === 2 && step1Done && (
                <div className={styles.stepBody}>
                  <div className={styles.deliveryCards}>
                    <button
                      type="button"
                      className={`${styles.deliveryCard} ${deliveryMethod === "domicile" ? styles.deliveryCardActive : ""}`}
                      onClick={() => setDeliveryMethod("domicile")}
                    >
                      <img
                        src={
                          deliveryMethod === "domicile"
                            ? "/icon/checkout/radio-checked.svg"
                            : "/icon/checkout/radio-unchecked.svg"
                        }
                        alt=""
                        className={styles.radioIcon}
                      />
                      <div className={styles.deliveryCardBody}>
                        <p className={styles.deliveryCardTitle}>{dict.checkout.homeDelivery}</p>
                        <p className={styles.deliveryCardHint}>{dict.checkout.homeDeliveryHintDesktop}</p>
                        <p className={styles.deliveryCardFee}>
                          {dict.checkout.fee}{" "}
                          <span>
                            {deliveryMethod === "domicile" && deliveryStatus === "loading"
                              ? dict.checkout.calculating
                              : deliveryMethod === "domicile" && deliveryStatus === "error"
                                ? dict.checkout.unavailable
                                : `+ ${formatPrice(deliveryMethod === "domicile" ? deliveryFee : 0)}`}
                          </span>
                        </p>
                      </div>
                      <img src="/icon/checkout/delivery-home-photo.png" alt="" className={styles.deliveryCardPhoto} />
                    </button>

                    <button
                      type="button"
                      className={`${styles.deliveryCard} ${deliveryMethod === "agence" ? styles.deliveryCardActive : ""}`}
                      onClick={() => setDeliveryMethod("agence")}
                    >
                      <img
                        src={
                          deliveryMethod === "agence"
                            ? "/icon/checkout/radio-checked.svg"
                            : "/icon/checkout/radio-unchecked.svg"
                        }
                        alt=""
                        className={styles.radioIcon}
                      />
                      <div className={styles.deliveryCardBody}>
                        <p className={styles.deliveryCardTitle}>{dict.checkout.pickupTitleDesktop}</p>
                        <p className={styles.deliveryCardHint}>{dict.checkout.pickupHintDesktop}</p>
                        <p className={styles.deliveryCardFee}>
                          {dict.checkout.fee} <span>{formatPrice(0)}</span>
                        </p>
                      </div>
                      <img src="/icon/checkout/storefront.svg" alt="" className={styles.deliveryCardIcon} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className={styles.validateButton}
                    disabled={!deliveryMethod}
                    onClick={handleValidateDelivery}
                  >
                    {dict.checkout.validateButton}
                  </button>
                </div>
              )}

              {step2Done && activeStep !== 2 && (
                <div className={styles.stepSummary}>
                  <span>{dict.checkout.productQuantity(totalQuantity)}</span>
                  <span>
                    {dict.checkout.deliveryModeLabel}{" "}
                    {deliveryMethod === "domicile" ? dict.checkout.homeDelivery : dict.checkout.pickupTitleMobile}
                  </span>
                </div>
              )}
            </div>

            {/* Step 3 — Mode de paiement */}
            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepHeaderLeft}>
                  <span className={`${styles.stepNumber} ${!step2Done ? styles.stepNumberLocked : ""}`}>3</span>
                  <h3 className={styles.stepTitle}>{dict.checkout.paymentStepTitle}</h3>
                </div>
                {!step2Done && <img src="/icon/checkout/lock.svg" alt="" className={styles.lockIcon} />}
              </div>

              {step2Done && (
                <div className={styles.stepBody}>
                  {!paymentMethod && <p className={styles.paymentPrompt}>{dict.checkout.selectPaymentPrompt}</p>}

                  <div className={styles.paymentCards}>
                    <button
                      type="button"
                      className={`${styles.paymentCard} ${paymentMethod === "cash" ? styles.paymentCardActive : ""}`}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icon/checkout/payment-cash.png" alt="" className={styles.paymentCardIcon} />
                      <p className={styles.paymentCardLabel}>{dict.checkout.cashPaymentDesktop}</p>
                    </button>

                    <button
                      type="button"
                      className={`${styles.paymentCard} ${paymentMethod === "online" ? styles.paymentCardActive : ""}`}
                      onClick={() => setPaymentMethod("online")}
                    >
                      <span className={styles.onlineIcons}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icon/checkout/payment-orange.png" alt="Orange Money" className={styles.onlinePaymentIcon} />
                        <span className={styles.onlineOu}>{dict.checkout.or}</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icon/checkout/payment-mtn.png" alt="MTN Mobile Money" className={styles.onlinePaymentIcon} />
                      </span>
                      <p className={styles.paymentCardLabel}>{dict.checkout.onlinePayment}</p>
                    </button>
                  </div>

                  <p className={styles.securePayment}>
                    <img src="/icon/checkout/lock.svg" alt="" className={styles.secureLockIcon} />
                    {dict.checkout.securePayment}
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className={styles.summary}>
            <p className={styles.summaryHeaderLabel}>{dict.cart.summaryTotal}:</p>
            <p className={styles.summaryHeaderValue}>{formatPrice(total)}</p>

            <div className={styles.summaryRow}>
              <span className={styles.summaryRowLabel}>{dict.checkout.subtotal}</span>
              <span className={styles.summaryRowValue}>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryRowLabel}>{dict.checkout.discount}</span>
              <span className={styles.summaryRowValue}>{formatPrice(discountAmount)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryRowLabel}>{dict.cart.deliveryLabel}</span>
              <span className={styles.summaryRowValue}>{formatPrice(livraisonFee)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span className={styles.summaryRowLabel}>{dict.cart.summaryTotal}</span>
              <span className={styles.summaryRowValue}>{formatPrice(total)}</span>
            </div>

            <div className={styles.couponSection}>
              <button
                type="button"
                className={styles.couponToggle}
                onClick={() => setCouponOpen((v) => !v)}
                aria-expanded={couponOpen}
              >
                <span>{dict.cart.couponQuestion}</span>
                <img
                  src="/icon/cart/coupon-chevron.svg"
                  alt=""
                  className={`${styles.couponChevron} ${couponOpen ? styles.couponChevronOpen : ""}`}
                />
              </button>

              {couponOpen && (
                <div className={styles.couponForm}>
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
              )}
              {couponStatus === "applied" && <p className={styles.couponSuccess}>{dict.cart.couponApplied}</p>}
              {couponStatus === "invalid" && couponError && <p className={styles.checkoutWarning}>{couponError}</p>}
            </div>

            <button
              type="button"
              className={styles.checkoutButton}
              disabled={!canPlaceOrder}
              onClick={handlePlaceOrder}
            >
              {placing ? dict.checkout.sendingButton : dict.cart.placeOrder}
            </button>
            {!canPlaceOrder && !placing && (
              <p className={styles.checkoutWarning}>
                {!step1Done
                  ? dict.checkout.completeAddressWarning
                  : !step2Done
                    ? dict.checkout.selectDeliveryWarning
                    : dict.checkout.selectPaymentPrompt}
              </p>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
