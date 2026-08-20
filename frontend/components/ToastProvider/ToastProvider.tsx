"use client";

import { useEffect, useRef, useState } from "react";
import { clearSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { onSessionExpired } from "@/lib/sessionEvents";
import { onToast, type ToastPayload } from "@/lib/toast";
import styles from "./ToastProvider.module.css";

interface ActiveToast extends ToastPayload {
  id: number;
}

const AUTO_DISMISS_MS = 4000;

// Mounted once in app/[lang]/layout.tsx alongside WhatsAppButton/
// SupportButton/PushNotificationRegistrar — renders nothing until a
// showToast() call comes in over the shared lib/toast.ts channel. Also owns
// the visible side of session expiry: authedFetch (lib/api.ts) fires
// shopitech:session-expired on any 401 from an authenticated call, and this
// is where that becomes an actual cleared session + a message the shopper
// can see, instead of the UI quietly continuing to look logged-in.
export default function ToastProvider() {
  const dict = useDictionary();
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const nextId = useRef(0);

  function pushToast(payload: ToastPayload) {
    const id = nextId.current++;
    setToasts((current) => [...current, { ...payload, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
  }

  useEffect(() => onToast(pushToast), []);

  useEffect(
    () =>
      onSessionExpired(() => {
        clearSession();
        pushToast({ message: dict.session.expired, variant: "error" });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dict]
  );

  function dismiss(id: number) {
    setToasts((current) => current.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className={styles.stack}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[`toast-${toast.variant}`]}`}
          role={toast.variant === "error" ? "alert" : "status"}
        >
          <span className={styles.message}>{toast.message}</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => dismiss(toast.id)}
            aria-label={dict.common.close}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
