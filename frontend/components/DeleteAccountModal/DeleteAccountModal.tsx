"use client";

import { useState } from "react";
import { ApiValidationError, deleteAccount } from "@/lib/api";
import { clearSession, getSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import styles from "./DeleteAccountModal.module.css";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

// Shared by the mobile and desktop profile pages. Backend requires the
// current password as a final identity check (AuthController::destroy) and
// the deletion itself is permanent — anonymizes the account, revokes every
// token, no recovery path — hence the explicit warning + checkbox gate on
// top of the password field, rather than a single confirm click.
export default function DeleteAccountModal({ open, onClose }: DeleteAccountModalProps) {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const [acknowledged, setAcknowledged] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleClose() {
    setAcknowledged(false);
    setPassword("");
    setError(null);
    setSubmitting(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const session = getSession();
    if (!session || !acknowledged || !password) return;

    setSubmitting(true);
    setError(null);
    try {
      await deleteAccount(session.token, password);
      clearSession();
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.deleteAccount.genericError
      );
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <WarningIcon className={styles.warningIcon} />
          <h2 className={styles.title}>{dict.deleteAccount.modalTitle}</h2>
        </div>

        <div className={styles.warningBox}>
          <p className={styles.warningTitle}>{dict.deleteAccount.warningTitle}</p>
          <p className={styles.warningText}>{dict.deleteAccount.warningText}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className={styles.checkbox}
            />
            {dict.deleteAccount.confirmCheckbox}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{dict.deleteAccount.passwordLabel}</span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={dict.deleteAccount.passwordPlaceholder}
              className={styles.input}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={handleClose} disabled={submitting}>
              {dict.deleteAccount.cancel}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting || !acknowledged || !password}
            >
              {submitting ? dict.deleteAccount.submitting : dict.deleteAccount.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.5 2 20.5h20L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 10v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17.3" r="1" fill="currentColor" />
    </svg>
  );
}
