"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { useCheckout } from "./CheckoutContext";
import CheckoutSuccessContent from "./CheckoutSuccessContent";
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
  const {
    cartStatus,
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
    total,
    orderNumber,
    checkoutError,
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

  if (orderNumber) {
    return (
      <div className={styles.page}>
        <Header cartCount={items.length} />
        <main className={styles.successMain}>
          <CheckoutSuccessContent orderNumber={orderNumber} />
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
          <h1 className={styles.title}>Finaliser votre commande</h1>
          <h2 className={styles.summaryTitle}>Resumé de la commande</h2>
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
                  <h3 className={step1Done ? styles.stepTitleDone : styles.stepTitle}>Adresse de livraison</h3>
                </div>
                {step1Done && activeStep !== 1 && (
                  <button type="button" className={styles.modifyButton} onClick={() => setActiveStep(1)}>
                    <img src="/icon/checkout/pen.svg" alt="" className={styles.modifyIcon} />
                    Modifier
                  </button>
                )}
              </div>

              {activeStep === 1 && (
                <div className={styles.stepBody}>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span className={styles.label}>
                        <span className={styles.required}>*</span>Nom
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-user.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="text"
                          value={form.nom}
                          onChange={(e) => setForm({ nom: e.target.value })}
                          placeholder="Jean"
                          className={styles.input}
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>
                        <span className={styles.required}>*</span>Prenom
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-user.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="text"
                          value={form.prenom}
                          onChange={(e) => setForm({ prenom: e.target.value })}
                          placeholder="Pierre"
                          className={styles.input}
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>
                        <span className={styles.required}>*</span>N° Téléphone
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-phone.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="tel"
                          value={form.telephone}
                          onChange={(e) => setForm({ telephone: e.target.value })}
                          placeholder="Ex: 677 47 22 14"
                          className={styles.input}
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>E-mail (Facultatif)</span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-mail.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ email: e.target.value })}
                          placeholder="exemple@gmail.com"
                          className={styles.input}
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>
                        <span className={styles.required}>*</span>Ville
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-address.svg" alt="" className={styles.inputIcon} />
                        <select
                          value={form.cityId}
                          onChange={(e) => setForm({ cityId: e.target.value, neighborhoodId: "" })}
                          className={styles.select}
                        >
                          <option value="">Selectionez la ville</option>
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
                        <span className={styles.required}>*</span>Quartier
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-address.svg" alt="" className={styles.inputIcon} />
                        <select
                          value={form.neighborhoodId}
                          onChange={(e) => setForm({ neighborhoodId: e.target.value })}
                          disabled={!form.cityId}
                          className={styles.select}
                        >
                          <option value="">Selectionez le quartier</option>
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
                        <span className={styles.required}>*</span>Adresse
                      </span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-address.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="text"
                          value={form.adresse}
                          onChange={(e) => setForm({ adresse: e.target.value })}
                          placeholder="Rue, quartier précis, point de repère..."
                          className={styles.input}
                        />
                      </div>
                    </label>
                  </div>

                  <p className={styles.subheading}>Autres information facultative</p>

                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span className={styles.label}>Contact WhatsApp</span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-whatsapp.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="tel"
                          value={form.whatsapp}
                          onChange={(e) => setForm({ whatsapp: e.target.value })}
                          placeholder="Ex: 697 47 22 14"
                          className={styles.input}
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Deuxieme numéro de téléphone</span>
                      <div className={styles.inputBox}>
                        <img src="/icon/checkout/field-phone.svg" alt="" className={styles.inputIcon} />
                        <input
                          type="tel"
                          value={whatsappSecondary}
                          onChange={(e) => setWhatsappSecondary(e.target.value)}
                          placeholder="Ex: 677 47 22 14"
                          className={styles.input}
                        />
                      </div>
                    </label>
                  </div>

                  <p className={styles.note}>
                    <strong>NB:</strong> Les champs précédés du symbole <span className={styles.required}>*</span>{" "}
                    sont obligatoire
                  </p>

                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={!isAddressComplete}
                    onClick={handleSaveAddress}
                  >
                    Enregistrer et continuer
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
                  <h3 className={step2Done ? styles.stepTitleDone : styles.stepTitle}>Méthode de livraison</h3>
                </div>
                {!step1Done && <img src="/icon/checkout/lock.svg" alt="" className={styles.lockIcon} />}
                {step2Done && activeStep !== 2 && (
                  <button type="button" className={styles.modifyButton} onClick={() => setActiveStep(2)}>
                    <img src="/icon/checkout/pen.svg" alt="" className={styles.modifyIcon} />
                    Modifier
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
                        <p className={styles.deliveryCardTitle}>Livraison à domicile</p>
                        <p className={styles.deliveryCardHint}>
                          Nous vous livrons chez vous / nous expédions dans votre ville
                        </p>
                        <p className={styles.deliveryCardFee}>
                          Frais :{" "}
                          <span>
                            {deliveryMethod === "domicile" && deliveryStatus === "loading"
                              ? "Calcul..."
                              : deliveryMethod === "domicile" && deliveryStatus === "error"
                                ? "Indisponible"
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
                        <p className={styles.deliveryCardTitle}>Retrait à Akwa</p>
                        <p className={styles.deliveryCardHint}>
                          Vous venez récuperer vos produit a akwa cogeni douche / A coté de Fokou douche
                        </p>
                        <p className={styles.deliveryCardFee}>
                          Frais : <span>{formatPrice(0)}</span>
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
                    Valider
                  </button>
                </div>
              )}

              {step2Done && activeStep !== 2 && (
                <div className={styles.stepSummary}>
                  <span>Quantité de produit: {totalQuantity}</span>
                  <span>
                    Mode de livraison: {deliveryMethod === "domicile" ? "Livraison a domicile" : "Retrait en agence"}
                  </span>
                </div>
              )}
            </div>

            {/* Step 3 — Mode de paiement */}
            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepHeaderLeft}>
                  <span className={`${styles.stepNumber} ${!step2Done ? styles.stepNumberLocked : ""}`}>3</span>
                  <h3 className={styles.stepTitle}>Mode de paiement</h3>
                </div>
                {!step2Done && <img src="/icon/checkout/lock.svg" alt="" className={styles.lockIcon} />}
              </div>

              {step2Done && (
                <div className={styles.stepBody}>
                  {!paymentMethod && <p className={styles.paymentPrompt}>Veuillez sélectionner un mode paiement</p>}

                  <div className={styles.paymentCards}>
                    <button
                      type="button"
                      className={`${styles.paymentCard} ${paymentMethod === "cash" ? styles.paymentCardActive : ""}`}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icon/checkout/payment-cash.png" alt="" className={styles.paymentCardIcon} />
                      <p className={styles.paymentCardLabel}>Paiement a la livraison</p>
                    </button>

                    <button
                      type="button"
                      className={`${styles.paymentCard} ${paymentMethod === "online" ? styles.paymentCardActive : ""}`}
                      onClick={() => setPaymentMethod("online")}
                    >
                      <span className={styles.onlineIcons}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icon/checkout/payment-orange.png" alt="Orange Money" className={styles.onlinePaymentIcon} />
                        <span className={styles.onlineOu}>ou</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icon/checkout/payment-mtn.png" alt="MTN Mobile Money" className={styles.onlinePaymentIcon} />
                      </span>
                      <p className={styles.paymentCardLabel}>Paiement en ligne</p>
                    </button>
                  </div>

                  <p className={styles.securePayment}>
                    <img src="/icon/checkout/lock.svg" alt="" className={styles.secureLockIcon} />
                    Paiement sécurisé
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className={styles.summary}>
            <p className={styles.summaryHeaderLabel}>Total:</p>
            <p className={styles.summaryHeaderValue}>{formatPrice(total)}</p>

            <div className={styles.summaryRow}>
              <span className={styles.summaryRowLabel}>Sous Total</span>
              <span className={styles.summaryRowValue}>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryRowLabel}>Livraison</span>
              <span className={styles.summaryRowValue}>{formatPrice(livraisonFee)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span className={styles.summaryRowLabel}>Total</span>
              <span className={styles.summaryRowValue}>{formatPrice(total)}</span>
            </div>

            <div className={styles.couponSection}>
              <button
                type="button"
                className={styles.couponToggle}
                onClick={() => setCouponOpen((v) => !v)}
                aria-expanded={couponOpen}
              >
                <span>Vous avez un coupon de réduction ?</span>
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
                    placeholder="Saisissez le code ici"
                    className={styles.couponInput}
                  />
                  <button type="button" className={styles.couponApply}>
                    Appliquer
                    <img src="/icon/cart/coupon-check.svg" alt="" className={styles.couponApplyIcon} />
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className={styles.checkoutButton}
              disabled={!canPlaceOrder}
              onClick={handlePlaceOrder}
            >
              {placing ? "Envoi..." : "Passer la commande"}
            </button>
            {!canPlaceOrder && !placing && (
              <p className={styles.checkoutWarning}>
                {!step1Done
                  ? "Veuillez completer l'adresse de livraison"
                  : !step2Done
                    ? "Veuillez selectionner le mode de livraison"
                    : "Veuillez sélectionner un mode paiement"}
              </p>
            )}
            {checkoutError && <p className={styles.checkoutWarning}>{checkoutError}</p>}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
