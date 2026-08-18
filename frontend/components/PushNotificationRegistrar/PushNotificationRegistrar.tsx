"use client";

import { useEffect } from "react";
import { getSession } from "@/lib/auth";
import { initPushNotifications, listenForForegroundMessages } from "@/lib/firebase/messaging";

// Renders nothing — mounted once in app/[lang]/layout.tsx alongside
// WhatsAppButton/SupportButton. Covers the "already logged in" case (page
// refresh, reopening the app) that a login-time call to
// initPushNotifications() can't: that one only fires at the moment a
// session is created, not on every subsequent load.
export default function PushNotificationRegistrar() {
  useEffect(() => {
    const session = getSession();
    if (!session) return;

    void initPushNotifications(session.token);
    void listenForForegroundMessages();
  }, []);

  return null;
}
