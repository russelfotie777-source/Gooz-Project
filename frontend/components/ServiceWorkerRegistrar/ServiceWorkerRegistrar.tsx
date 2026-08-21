"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/serviceWorker";

// Mounted once in app/[lang]/layout.tsx alongside the other always-on
// globals (WhatsAppButton, SupportButton, PushNotificationRegistrar...).
// Unlike PushNotificationRegistrar, this doesn't wait on notification
// permission — offline caching should start working for every visitor,
// not just the ones who opted into push.
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return null;
}
