import { registerDeviceToken } from "@/lib/api";
import { registerServiceWorker } from "@/lib/serviceWorker";
import { FIREBASE_VAPID_KEY, firebaseConfig } from "./config";

// Everything here is browser-only (Notification, serviceWorker, FCM token
// generation don't exist server-side) and imports the Firebase SDK
// dynamically so it never ends up in a server bundle.
async function getMessagingInstance() {
  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getMessaging, isSupported } = await import("firebase/messaging");

  if (!(await isSupported())) return null;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getMessaging(app);
}

// Requests notification permission (only if not already decided) and, if
// granted, registers the resulting FCM token with our backend so
// PushNotificationService can reach this device. Fails silently — push
// notifications are a nice-to-have, never something that should break the
// rest of the app if the browser/user doesn't cooperate.
export async function initPushNotifications(authToken: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

  try {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    } else if (Notification.permission !== "granted") {
      return;
    }

    const messaging = await getMessagingInstance();
    if (!messaging) return;

    const registration = await registerServiceWorker();
    if (!registration) return;

    const { getToken } = await import("firebase/messaging");
    const fcmToken = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!fcmToken) return;

    await registerDeviceToken(authToken, fcmToken, "web");
  } catch (error) {
    console.error("Push notification setup failed", error);
  }
}

// Background messages are handled by public/sw.js, but
// FCM only invokes that handler when the tab isn't focused — a message
// arriving while the app is open needs to be shown explicitly.
export async function listenForForegroundMessages(): Promise<void> {
  // Notification.permission on a browser without the Notification API at
  // all (unlike the rest of this module, which checks "Notification" in
  // window / isSupported() first) throws a ReferenceError, not just
  // undefined — this has to be checked before touching that property.
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const messaging = await getMessagingInstance();
  if (!messaging) return;

  const { onMessage } = await import("firebase/messaging");
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? "Shopitech";
    const body = payload.notification?.body;
    new Notification(title, { body, icon: "/icon-shopitech/logoFichier 33ICON.png" });
  });
}
