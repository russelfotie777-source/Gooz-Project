"use client";

import { useRouter } from "next/navigation";
import CheckoutMobileShell from "./CheckoutMobileShell";
import { useCheckout } from "./CheckoutContext";
import styles from "./CheckoutAddressStep.module.css";

export default function CheckoutAddressStep() {
  const router = useRouter();
  const { form, setForm, isAddressComplete, cities, neighborhoods: allNeighborhoods } = useCheckout();

  const neighborhoods = form.cityId
    ? allNeighborhoods.filter((n) => n.city_id === Number(form.cityId))
    : [];

  return (
    <CheckoutMobileShell
      step={1}
      continueLabel="Continuez"
      continueDisabled={!isAddressComplete}
      onContinue={() => router.push("/checkout/livraison")}
    >
      <div className={styles.card}>
        <h1 className={styles.title}>Adresse de livraison</h1>

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
          <span className={styles.label}>N° WhatsApp</span>
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
          <span className={styles.label}>E-mail</span>
          <div className={styles.inputBox}>
            <img src="/icon/checkout/field-mail.svg" alt="" className={styles.inputIcon} />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ email: e.target.value })}
              placeholder="example@gmail.com"
              className={styles.input}
            />
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
            <img src="/icon/product-detail/chevron-down.svg" alt="" className={styles.selectChevron} />
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
            <img src="/icon/product-detail/chevron-down.svg" alt="" className={styles.selectChevron} />
          </div>
        </label>

        <p className={styles.note}>
          <strong>NB:</strong> Les champs précédés du symbole <span className={styles.required}>*</span> sont
          obligatoire
        </p>
      </div>
    </CheckoutMobileShell>
  );
}
