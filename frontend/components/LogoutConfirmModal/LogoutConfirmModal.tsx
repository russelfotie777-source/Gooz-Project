"use client";

import { useRef } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useModalA11y } from "@/lib/useModalA11y";
import styles from "./LogoutConfirmModal.module.css";

interface LogoutConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// Shared by the mobile (ProfileLoggedIn) and desktop (ProfileDesktop) profile
// pages: logout used to fire instantly on click with no way to back out of an
// accidental tap. Styled after DeleteAccountModal's overlay/modal pattern,
// minus the password/checkbox gate since logout is reversible (just sign in
// again) — a single confirm step is enough.
export default function LogoutConfirmModal({ open, onCancel, onConfirm }: LogoutConfirmModalProps) {
  const dict = useDictionary();
  const modalRef = useRef<HTMLDivElement>(null);

  useModalA11y(open, onCancel, modalRef);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <h2 className={styles.title}>{dict.profile.logoutConfirmTitle}</h2>
        <p className={styles.text}>{dict.profile.logoutConfirmText}</p>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            {dict.profile.logoutConfirmCancel}
          </button>
          <button type="button" className={styles.submitButton} onClick={onConfirm}>
            {dict.profile.logoutConfirmYes}
          </button>
        </div>
      </div>
    </div>
  );
}
