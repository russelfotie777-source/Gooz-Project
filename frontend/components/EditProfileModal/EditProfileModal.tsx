"use client";

import { useRef, useState } from "react";
import { ApiValidationError, updateProfile } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { showToast } from "@/lib/toast";
import type { User } from "@/lib/types";
import { useFocusOnError } from "@/lib/useFocusOnError";
import { useModalA11y } from "@/lib/useModalA11y";
import styles from "./EditProfileModal.module.css";

interface EditProfileModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUpdated: (user: User) => void;
}

// Shared by ProfileLoggedIn (mobile) and ProfileDesktop: the pencil icon next
// to the user's name/phone used to be a dead button — wired here to the real
// PUT /me endpoint (name + phone only, since the Users table has no email
// column). Styled after DeleteAccountModal's overlay/modal pattern.
export default function EditProfileModal({ open, user, onClose, onUpdated }: EditProfileModalProps) {
  const dict = useDictionary();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const errorRef = useFocusOnError<HTMLParagraphElement>(error);

  useModalA11y(open, handleClose, modalRef);

  if (!open) return null;

  function handleClose() {
    // Guards both paths that call this: the overlay's onClick and Escape
    // (via useModalA11y) — neither should be able to abandon an in-flight
    // save. The Cancel button has its own `disabled` for the same reason.
    if (submitting) return;
    setName(user.name);
    setPhone(user.phone ?? "");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const session = getSession();
    if (!session) return;

    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateProfile(session.token, { name: name.trim(), phone: phone.trim() });
      onUpdated(updated);
      onClose();
      showToast(dict.editProfile.updateSuccess, "success");
    } catch (err) {
      setError(
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.editProfile.genericError
      );
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
        <h2 className={styles.title}>{dict.editProfile.modalTitle}</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>{dict.editProfile.nameLabel}</span>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{dict.editProfile.phoneLabel}</span>
            <input
              required
              type="tel"
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
              {dict.editProfile.cancel}
            </button>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? dict.editProfile.saving : dict.editProfile.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
