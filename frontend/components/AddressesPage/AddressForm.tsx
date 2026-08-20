"use client";

import { useState } from "react";
import { ApiValidationError, type AddressPayload } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import type { Address } from "@/lib/types";
import { useFocusOnError } from "@/lib/useFocusOnError";
import styles from "./AddressForm.module.css";

interface AddressFormProps {
  initial?: Address | null;
  onSubmit: (payload: AddressPayload) => Promise<void>;
  onCancel: () => void;
}

// Shared between AddressesPage (mobile) and AddressesDesktop — a plain
// vertical form has no real mobile/desktop layout difference, so one
// component covers both (unlike the Auth pages, which differ enough in
// structure to warrant separate mobile/desktop components).
export default function AddressForm({ initial, onSubmit, onCancel }: AddressFormProps) {
  const dict = useDictionary();
  const [label, setLabel] = useState(initial?.label ?? "");
  const [recipientName, setRecipientName] = useState(initial?.recipient_name ?? "");
  const [recipientPhone, setRecipientPhone] = useState(initial?.recipient_phone ?? "");
  const [ville, setVille] = useState(initial?.ville ?? "");
  const [quartier, setQuartier] = useState(initial?.quartier ?? "");
  const [addressLine, setAddressLine] = useState(initial?.address_line ?? "");
  const [isDefault, setIsDefault] = useState(initial?.is_default ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useFocusOnError<HTMLParagraphElement>(error);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        label: label.trim() || null,
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        ville: ville.trim(),
        quartier: quartier.trim() || null,
        address_line: addressLine.trim() || null,
        is_default: isDefault,
      });
    } catch (err) {
      setError(err instanceof ApiValidationError ? (Object.values(err.errors)[0]?.[0] ?? err.message) : dict.addresses.genericError);
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>
        {initial ? dict.addresses.formTitleEdit : dict.addresses.formTitleNew}
      </h2>

      <label className={styles.field}>
        <span className={styles.label}>{dict.addresses.labelField}</span>
        <div className={styles.inputBox}>
          <img src="/icon/checkout/field-user.svg" alt="" className={styles.inputIcon} />
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={dict.addresses.labelPlaceholder}
            className={styles.input}
          />
        </div>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>
          <span className={styles.required}>*</span>{dict.addresses.recipientName}
        </span>
        <div className={styles.inputBox}>
          <img src="/icon/checkout/field-user.svg" alt="" className={styles.inputIcon} />
          <input
            required
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className={styles.input}
          />
        </div>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>
          <span className={styles.required}>*</span>{dict.addresses.recipientPhone}
        </span>
        <div className={styles.inputBox}>
          <img src="/icon/checkout/field-phone.svg" alt="" className={styles.inputIcon} />
          <input
            required
            type="tel"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            className={styles.input}
          />
        </div>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>
          <span className={styles.required}>*</span>{dict.addresses.ville}
        </span>
        <div className={styles.inputBox}>
          <img src="/icon/checkout/field-address.svg" alt="" className={styles.inputIcon} />
          <input
            required
            type="text"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className={styles.input}
          />
        </div>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>{dict.addresses.quartier}</span>
        <div className={styles.inputBox}>
          <img src="/icon/checkout/field-address.svg" alt="" className={styles.inputIcon} />
          <input
            type="text"
            value={quartier}
            onChange={(e) => setQuartier(e.target.value)}
            className={styles.input}
          />
        </div>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>{dict.addresses.addressLine}</span>
        <div className={styles.inputBox}>
          <img src="/icon/checkout/field-address.svg" alt="" className={styles.inputIcon} />
          <input
            type="text"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            className={styles.input}
          />
        </div>
      </label>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className={styles.checkbox}
        />
        {dict.addresses.setAsDefault}
      </label>

      {error && (
        <p ref={errorRef} tabIndex={-1} className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={submitting}>
          {dict.addresses.cancel}
        </button>
        <button type="submit" className={styles.saveButton} disabled={submitting}>
          {submitting ? dict.addresses.saving : dict.addresses.save}
        </button>
      </div>
    </form>
  );
}
