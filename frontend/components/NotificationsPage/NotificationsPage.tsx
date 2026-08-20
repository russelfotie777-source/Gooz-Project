"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav/BottomNav";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { formatRelativeTime } from "@/lib/relativeTime";
import { useNotifications } from "./useNotifications";
import styles from "./NotificationsPage.module.css";

// Figma: node 642:794 ("Tout" tab) / 653:925 ("Non Lu" tab) — no desktop
// design exists for this screen (the bell that opens it only lives in the
// mobile BottomNav), so this stays mobile-only like AddressesPage.
export default function NotificationsPage() {
  const dict = useDictionary();
  const lang = useLang();
  const router = useLocaleRouter();
  const { status, notifications, retryLoad, markRead, markAllRead } = useNotifications();
  const [tab, setTab] = useState<"all" | "unread">("all");

  const visible = tab === "unread" ? notifications.filter((n) => !n.is_read) : notifications;
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backButton}
          aria-label={dict.header.back}
          onClick={() => router.back()}
        >
          <img src="/icon/product-detail/back.svg" alt="" className={styles.backIcon} />
        </button>
        <h1 className={styles.title}>{dict.notifications.title}</h1>
        <span className={styles.spacer} aria-hidden />
      </div>

      {status === "ready" && (
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === "all" ? styles.tabActive : ""}`}
            onClick={() => setTab("all")}
          >
            {dict.notifications.tabAll}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === "unread" ? styles.tabActive : ""}`}
            onClick={() => setTab("unread")}
          >
            {dict.notifications.tabUnread}
          </button>
          {hasUnread && (
            <button type="button" className={styles.markAllReadButton} onClick={markAllRead}>
              {dict.notifications.markAllRead}
            </button>
          )}
        </div>
      )}

      <main className={styles.main}>
        {status === "loading" && <p className={styles.message}>{dict.notifications.loading}</p>}

        {status === "loggedOut" && (
          <div className={styles.message}>
            <p>{dict.notifications.loginPrompt}</p>
            <LocaleLink href="/connexion" className={styles.loginLink}>
              {dict.notifications.login}
            </LocaleLink>
          </div>
        )}

        {status === "error" && (
          <div className={styles.message}>
            <p>{dict.notifications.loadError}</p>
            <button type="button" className={styles.loginLink} onClick={retryLoad}>
              {dict.notifications.retry}
            </button>
          </div>
        )}

        {status === "ready" && visible.length === 0 && (
          <p className={styles.message}>
            {tab === "unread" ? dict.notifications.emptyUnread : dict.notifications.emptyAll}
          </p>
        )}

        {status === "ready" && visible.length > 0 && (
          <div className={styles.list}>
            {visible.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.card} ${notification.is_read ? styles.cardRead : ""}`}
              >
                <img src="/icon/notifications/bell.svg" alt="" className={styles.bellIcon} />
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <p className={styles.cardTitle}>{notification.title}</p>
                    <span className={styles.cardTime}>{formatRelativeTime(notification.created_at, lang)}</span>
                  </div>
                  {notification.body && <p className={styles.cardText}>{notification.body}</p>}
                  {!notification.is_read && (
                    <button
                      type="button"
                      className={styles.markReadButton}
                      onClick={() => markRead(notification.id)}
                    >
                      {dict.notifications.markRead}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
