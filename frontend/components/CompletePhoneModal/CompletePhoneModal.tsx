"use client";

import { useRef, useState } from "react";
import { ApiValidationError, updateProfile } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import type { User } from "@/lib/types";
import { useFocusOnError } from "@/lib/useFocusOnError";
import { useModalA11y } from "@/lib/useModalA11y";
import styles from "./CompletePhoneModal.module.css";

const DISMISS_KEY = "shopitech-phone-prompt-dismissed";

interface CompletePhoneModalProps {
  user: User | null;
  onUpdated: (user: User) => void;
}

// Google/Facebook sign-in creates the account before a phone number is
// known (Firebase doesn't hand one over) — this nudges the shopper to add
// one, since delivery needs it either way. Deliberately not a hard gate
// (agreed: "rappel discret, ignorable") — "Plus tard" just hides it for the
// rest of this browser session via sessionStorage, not forever, since the
// account still has no phone next time and checkout will ask again anyway.
export default function CompletePhoneModal({ user, onUpdated }: CompletePhoneModalProps) {
  const dict = useDictionary();
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && window.sessionStorage.getItem(DISMISS_KEY) === "1"
  );
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const errorRef = useFocusOnError<HTMLParagraphElement>(error);

  const open = Boolean(user) && !user?.phone && !dismissed;
  useModalA11y(open, handleDismiss, modalRef);

  if (!open || !user) return null;
  const currentUser = user;

  function handleDismiss() {
    // Escape (via useModalA11y) shouldn't abandon an in-flight save — the
    // "Plus tard" button already has its own `disabled` for the same reason.
    if (submitting) return;
    window.sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const session = getSession();
    if (!session) return;

    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateProfile(session.token, { name: currentUser.name, phone: phone.trim() });
      onUpdated(updated);
    } catch (err) {
      setError(
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.completePhone.genericError
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div ref={modalRef} className={styles.modal} role="dialog" aria-modal="true" tabIndex={-1}>
        <h2 className={styles.title}>{dict.completePhone.title}</h2>
        <p className={styles.text}>{dict.completePhone.text}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>{dict.completePhone.phoneLabel}</span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={dict.completePhone.phonePlaceholder}
              className={styles.input}
            />
          </label>

          {error && (
            <p ref={errorRef} tabIndex={-1} className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={handleDismiss} disabled={submitting}>
              {dict.completePhone.later}
            </button>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? dict.completePhone.saving : dict.completePhone.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
