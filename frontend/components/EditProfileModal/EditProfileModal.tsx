"use client";

import { useEffect, useRef, useState } from "react";
import { ApiValidationError, removeAvatar, updateProfile, uploadAvatar } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { showToast } from "@/lib/toast";
import type { User } from "@/lib/types";
import { useFocusOnError } from "@/lib/useFocusOnError";
import { useModalA11y } from "@/lib/useModalA11y";
import styles from "./EditProfileModal.module.css";

const DEFAULT_AVATAR = "/icon/profile/avatar-photo.png";
// Mirrors the backend's own UpdateAvatarRequest (ImageResizer::uploadRule()
// accepts jpg/jpeg/png/gif/bmp/webp/avif by content sniff) and its 4096KB
// cap — checked here too so a huge/wrong file is rejected instantly instead
// of only after a full upload round-trip.
const MAX_AVATAR_BYTES = 4096 * 1024;

interface EditProfileModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUpdated: (user: User) => void;
}

// Shared by ProfileLoggedIn (mobile) and ProfileDesktop: the pencil icon next
// to the user's name/phone used to be a dead button — wired here to the real
// PUT /me endpoint. Styled after DeleteAccountModal's overlay/modal pattern.
export default function EditProfileModal({ open, user, onClose, onUpdated }: EditProfileModalProps) {
  const dict = useDictionary();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [recoveryEmail, setRecoveryEmail] = useState(user.recovery_email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useFocusOnError<HTMLParagraphElement>(error);

  useModalA11y(open, handleClose, modalRef);

  // Revokes the local preview URL whenever it's replaced or the modal
  // unmounts — object URLs otherwise leak until the page itself reloads.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  if (!open) return null;

  function handleClose() {
    // Guards both paths that call this: the overlay's onClick and Escape
    // (via useModalA11y) — neither should be able to abandon an in-flight
    // save. The Cancel button has its own `disabled` for the same reason.
    if (submitting || avatarBusy) return;
    setName(user.name);
    setPhone(user.phone ?? "");
    setRecoveryEmail(user.recovery_email ?? "");
    setError(null);
    onClose();
  }

  async function handleAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets picking the same file again re-fire onChange
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      setError(dict.editProfile.avatarTooLarge);
      return;
    }

    const session = getSession();
    if (!session) return;

    setError(null);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarBusy(true);
    try {
      const updated = await uploadAvatar(session.token, file);
      onUpdated(updated);
      showToast(dict.editProfile.avatarUpdateSuccess, "success");
    } catch (err) {
      setError(
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.editProfile.genericError
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleAvatarRemove() {
    const session = getSession();
    if (!session) return;

    setError(null);
    setAvatarBusy(true);
    try {
      const updated = await removeAvatar(session.token);
      onUpdated(updated);
      setAvatarPreview(null);
      showToast(dict.editProfile.avatarUpdateSuccess, "success");
    } catch (err) {
      setError(
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.editProfile.genericError
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const session = getSession();
    if (!session) return;

    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateProfile(session.token, {
        name: name.trim(),
        phone: phone.trim(),
        recovery_email: recoveryEmail.trim() || null,
      });
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
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarPreview ?? user.avatar ?? DEFAULT_AVATAR}
                alt=""
                className={styles.avatarPreview}
              />
              <button
                type="button"
                className={styles.avatarEditButton}
                aria-label={dict.editProfile.changePhoto}
                disabled={avatarBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                <CameraIcon className={styles.avatarEditIcon} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.avatarInput}
                onChange={handleAvatarSelected}
              />
            </div>
            {(user.avatar || avatarPreview) && (
              <button
                type="button"
                className={styles.avatarRemoveButton}
                disabled={avatarBusy}
                onClick={handleAvatarRemove}
              >
                {dict.editProfile.removePhoto}
              </button>
            )}
          </div>

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

          {/* Only meaningful for a phone+password account — a Firebase
              account's password lives in Firebase, not this backend, so
              there's nothing for AuthController::forgotPassword to reset
              for it (see ForgotPasswordPhoneModal). */}
          {!user.email && (
            <label className={styles.field}>
              <span className={styles.label}>{dict.editProfile.recoveryEmailLabel}</span>
              <input
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className={styles.input}
              />
              <span className={styles.hint}>{dict.editProfile.recoveryEmailHint}</span>
            </label>
          )}

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

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <path
        d="M7 4.5 6.2 6H4a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 4 16h12a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 16 6h-2.2L13 4.5h-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10.5" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
