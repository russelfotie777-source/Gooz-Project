"use client";

import { useDictionary } from "@/lib/i18n/I18nProvider";
import styles from "./PushPermissionPrompt.module.css";

interface PushPermissionPromptProps {
  onAccept: () => void;
  onDismiss: () => void;
}

// The explainer shown BEFORE the browser's own native permission popup —
// requesting that popup unprompted, with zero context, is the most
// documented push-notification anti-pattern (tanks acceptance rates, and an
// initial "Block" is effectively permanent: the browser won't ask again).
// This only ever appears when Notification.permission is still "default"
// (see PushNotificationRegistrar) — accepting here is what triggers the
// real browser prompt, not this component.
export default function PushPermissionPrompt({ onAccept, onDismiss }: PushPermissionPromptProps) {
  const dict = useDictionary();

  return (
    <div className={styles.card} role="dialog" aria-label={dict.pushPrompt.title}>
      <img src="/icon/notifications/bell.svg" alt="" className={styles.icon} />
      <div className={styles.text}>
        <p className={styles.title}>{dict.pushPrompt.title}</p>
        <p className={styles.subtitle}>{dict.pushPrompt.subtitle}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.laterButton} onClick={onDismiss}>
          {dict.pushPrompt.later}
        </button>
        <button type="button" className={styles.acceptButton} onClick={onAccept}>
          {dict.pushPrompt.accept}
        </button>
      </div>
    </div>
  );
}
