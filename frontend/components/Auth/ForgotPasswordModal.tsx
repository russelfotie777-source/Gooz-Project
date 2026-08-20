"use client";

import { useRef, useState } from "react";
import { EmailAuthError, sendPasswordReset } from "@/lib/firebase/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useFocusOnError } from "@/lib/useFocusOnError";
import { useModalA11y } from "@/lib/useModalA11y";
import styles from "./ForgotPasswordModal.module.css";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}

// Firebase-native reset (sendPasswordResetEmail) — entirely client-side, no
// backend involvement, only available for accounts signed in via email (see
// AuthDesktopPage/AuthMobileFlow, which only render the "Mot de passe
// oublié" trigger in email mode). Always shows the success state on
// auth/user-not-found too, so this can't be used to enumerate which emails
// have an account.
export default function ForgotPasswordModal({ open, onClose, initialEmail }: ForgotPasswordModalProps) {
  const dict = useDictionary();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const errorRef = useFocusOnError<HTMLParagraphElement>(error);

  useModalA11y(open, handleClose, modalRef);

  if (!open) return null;

  function handleClose() {
    setSubmitting(false);
    setError(null);
    setSent(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      if (err instanceof EmailAuthError && err.code === "auth/invalid-email") {
        setError(dict.auth.invalidEmail);
      } else {
        setSent(true);
      }
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
            <p className={styles.successText}>{dict.auth.forgotPasswordSuccess}</p>
            <button type="button" className={styles.submitButton} onClick={handleClose}>
              {dict.auth.backToLogin}
            </button>
          </>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <p className={styles.instructions}>{dict.auth.forgotPasswordInstructions}</p>

            <label className={styles.field}>
              <span className={styles.label}>{dict.auth.emailAddress}</span>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <button type="submit" className={styles.submitButton} disabled={submitting || !email}>
                {submitting ? dict.auth.forgotPasswordSending : dict.auth.forgotPasswordSubmit}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
