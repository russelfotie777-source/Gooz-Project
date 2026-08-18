"use client";

import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import CheckoutMobileShell from "./CheckoutMobileShell";
import { useCheckout } from "./CheckoutContext";
import styles from "./CheckoutAddressStep.module.css";

export default function CheckoutAddressStep() {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const { form, setForm, isAddressComplete, cities, neighborhoods: allNeighborhoods } = useCheckout();

  const neighborhoods = form.cityId
    ? allNeighborhoods.filter((n) => n.city_id === Number(form.cityId))
    : [];

  return (
    <CheckoutMobileShell
      step={1}
      continueLabel={dict.checkout.continueButton}
      continueDisabled={!isAddressComplete}
      onContinue={() => router.push("/checkout/livraison")}
    >
      <div className={styles.card}>
        <h1 className={styles.title}>{dict.checkout.addressTitle}</h1>

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
          <span className={styles.label}>{dict.checkout.whatsappLabel}</span>
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
          <span className={styles.label}>{dict.checkout.emailLabel}</span>
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
            <img src="/icon/product-detail/chevron-down.svg" alt="" className={styles.selectChevron} />
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
            <img src="/icon/product-detail/chevron-down.svg" alt="" className={styles.selectChevron} />
          </div>
        </label>

        <p className={styles.note}>
          <strong>{dict.checkout.requiredNoteLabel}</strong> {dict.checkout.requiredNoteText}
        </p>
      </div>
    </CheckoutMobileShell>
  );
}
