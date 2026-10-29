"use client";

import { useRef, useState } from "react";
import { ApiValidationError, requestPasswordReset } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useFocusOnError } from "@/lib/useFocusOnError";
import { useModalA11y } from "@/lib/useModalA11y";
import styles from "./ForgotPasswordModal.module.css";

interface ForgotPasswordPhoneModalProps {
  open: boolean;
  onClose: () => void;
  initialPhone?: string;
}

// Phone+password accounts' own "mot de passe oublié" — distinct from
// ForgotPasswordModal, which only works for Firebase email accounts (their
// password lives in Firebase, not this backend). This one calls
// AuthController::forgotPassword, which only actually sends anything if the
// account has a recovery_email on file (see EditProfileModal/the signup
// form's optional field) — always shows the same generic success state
// regardless, so this can't be used to probe which phone numbers have an
// account or a recovery email.
export default function ForgotPasswordPhoneModal({ open, onClose, initialPhone }: ForgotPasswordPhoneModalProps) {
  const dict = useDictionary();
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const errorRef = useFocusOnError<HTMLParagraphElement>(error);

  useModalA11y(open, handleClose, modalRef);

  if (!open) return null;

  function handleClose() {
    if (submitting) return;
    setError(null);
    setSent(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(phone);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiValidationError ? (Object.values(err.errors)[0]?.[0] ?? err.message) : dict.auth.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <h2 className={styles.title}>{dict.auth.forgotPasswordTitle}</h2>

        {sent ? (
          <>
            <p className={styles.successText}>{dict.auth.forgotPasswordPhoneSuccess}</p>
            <button type="button" className={styles.submitButton} onClick={handleClose}>
              {dict.auth.backToLogin}
            </button>
          </>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <p className={styles.instructions}>{dict.auth.forgotPasswordPhoneInstructions}</p>

            <label className={styles.field}>
              <span className={styles.label}>{dict.auth.phoneNumber}</span>
              <input
                required
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.input}
              />
            </label>

            {error && (
              <p ref={errorRef} tabIndex={-1} className={styles.error} role="alert">
                {error}
              </p>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.cancelButton} onClick={handleClose} disabled={submitting}>
                {dict.auth.backToLogin}
              </button>
              <button type="submit" className={styles.submitButton} disabled={submitting || !phone}>
                {submitting ? dict.auth.forgotPasswordSending : dict.auth.forgotPasswordSubmit}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
