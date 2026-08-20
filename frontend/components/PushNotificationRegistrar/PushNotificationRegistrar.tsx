"use client";

import { useEffect, useState } from "react";
import { onLogin } from "@/lib/authEvents";
import { getSession } from "@/lib/auth";
import { initPushNotifications, listenForForegroundMessages } from "@/lib/firebase/messaging";
import { dismissPushPrompt, isPushPromptDismissed } from "@/lib/pushPermission";
import PushPermissionPrompt from "./PushPermissionPrompt";

// Mounted once in app/[lang]/layout.tsx alongside WhatsAppButton/
// SupportButton. Two paths, depending on what the browser already knows:
// permission already "granted" (a returning shopper who said yes before) ->
// silently re-register, no popup needed. Permission still "default" (never
// asked) -> show our own explainer first; only a click on "Activer" there
// triggers the real native prompt. Never calls Notification.requestPermission()
// on mount unprompted — that's the anti-pattern this replaces.
export default function PushNotificationRegistrar() {
  const [showPrompt, setShowPrompt] = useState(false);

  function checkAndMaybePrompt() {
    const session = getSession();
    if (!session) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    if (Notification.permission === "granted") {
      void initPushNotifications(session.token);
      void listenForForegroundMessages();
    } else if (Notification.permission === "default" && !isPushPromptDismissed()) {
      setShowPrompt(true);
    }
  }

  useEffect(() => {
    checkAndMaybePrompt();
    // A fresh login/signup doesn't remount this component (mounted once at
    // the layout level) — without this, the very first opportunity to show
    // the prompt would be silently missed for anyone who wasn't already
    // logged in on initial page load.
    return onLogin(checkAndMaybePrompt);
  }, []);

  function handleAccept() {
    setShowPrompt(false);
    dismissPushPrompt();
    const session = getSession();
    if (!session) return;
    void initPushNotifications(session.token).then(() => listenForForegroundMessages());
  }

  function handleDismiss() {
    setShowPrompt(false);
    dismissPushPrompt();
  }

  if (!showPrompt) return null;
  return <PushPermissionPrompt onAccept={handleAccept} onDismiss={handleDismiss} />;
}
