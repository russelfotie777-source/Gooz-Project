"use client";

import { useEffect, useState } from "react";
import { getNotifications, isUnauthorized, markAllNotificationsRead, markNotificationRead } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { AppNotification } from "@/lib/types";

// Shared by the notifications page: the customer's own in-app notification
// inbox, backed by GET /notifications (auth required, same session-token
// pattern as orders/addresses/tickets — see useOrders.ts).
export function useNotifications() {
  const [status, setStatus] = useState<"loading" | "loggedOut" | "ready" | "error">("loading");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [token, setToken] = useState<string | null>(null);

  function load() {
    const session = getSession();
    if (!session) {
      setStatus("loggedOut");
      return;
    }

    setToken(session.token);
    setStatus("loading");
    getNotifications(session.token)
      .then((list) => {
        setNotifications(list);
        setStatus("ready");
      })
      .catch((err) => setStatus(isUnauthorized(err) ? "loggedOut" : "error"));
  }

  useEffect(load, []);

  async function markRead(id: number) {
    if (!token) return;
    // Optimistic: this is a low-stakes, easily-repeated action — waiting on
    // the round-trip before updating the UI would just make the "Marquer
    // comme lu" link feel unresponsive for no real benefit.
    setNotifications((current) => current.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await markNotificationRead(token, id);
    } catch {
      // A real failure here re-syncs on next load(); not worth reverting the
      // optimistic update and flashing the item back to "unread" for what's
      // very likely a transient blip.
    }
  }

  async function markAllRead() {
    if (!token) return;
    setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead(token);
    } catch {
      // Same reasoning as markRead above.
    }
  }

  return { status, notifications, retryLoad: load, markRead, markAllRead };
}
