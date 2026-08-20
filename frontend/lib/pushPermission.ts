// Whether the shopper has already dismissed our own pre-permission
// explainer (see PushPermissionPrompt) — separate from Notification.permission
// itself, which only tracks the *browser's* native decision. Without this,
// "Plus tard" would just show the same banner again on every visit.
const DISMISSED_KEY = "shopitech-push-prompt-dismissed";

export function isPushPromptDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissPushPrompt(): void {
  try {
    window.localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Best-effort — worst case the banner reappears next visit.
  }
}
