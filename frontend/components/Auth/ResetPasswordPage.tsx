"use client";

import { useState } from "react";
import { ApiValidationError, confirmPasswordReset } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useFocusOnError } from "@/lib/useFocusOnError";
import styles from "./ResetPasswordPage.module.css";

interface ResetPasswordPageProps {
  token: string;
  phone: string;
}

// Landed on from the link in ResetPasswordNotification's email (backend
// AuthController::forgotPassword/resetPassword) — phone+password accounts
// only, see ForgotPasswordPhoneModal for why this is a separate flow from
// ForgotPasswordModal's Firebase-native one.
export default function ResetPasswordPage({ token, phone }: ResetPasswordPageProps) {
  const dict = useDictionary();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const errorRef = useFocusOnError<HTMLParagraphElement>(error);

  // A link missing either part is unusable — most likely truncated by a
  // mail client, never something a valid flow produces.
  if (!token || !phone) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>{dict.auth.resetPasswordInvalidLinkTitle}</h1>
          <p className={styles.text}>{dict.auth.resetPasswordInvalidLinkText}</p>
          <LocaleLink href="/connexion" className={styles.submitButton}>
            {dict.auth.backToLogin}
          </LocaleLink>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(dict.auth.passwordMismatch);
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(phone, token, password, confirmPassword);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiValidationError ? (Object.values(err.errors)[0]?.[0] ?? err.message) : dict.auth.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>{dict.auth.resetPasswordSuccessTitle}</h1>
          <p className={styles.text}>{dict.auth.resetPasswordSuccessText}</p>
          <LocaleLink href="/connexion" className={styles.submitButton}>
            {dict.auth.login}
          </LocaleLink>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{dict.auth.resetPasswordTitle}</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>{dict.auth.password}</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{dict.auth.confirmPassword}</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
            />
          </label>

          {error && (
            <p ref={errorRef} tabIndex={-1} className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? dict.auth.forgotPasswordSending : dict.auth.resetPasswordSubmit}
          </button>
        </form>
      </div>
    </div>
  );
}
