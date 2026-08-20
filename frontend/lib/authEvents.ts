// Fired right after a successful login/signup (AuthMobileFlow, AuthDesktopPage)
// so PushNotificationRegistrar — mounted once at the layout level and thus
// not remounted by a client-side navigation away from the auth pages — knows
// to re-run its permission check for the session that just appeared, instead
// of only ever checking once on the very first page load.
const LOGIN_EVENT = "shopitech:login";

export function notifyLogin(): void {
  window.dispatchEvent(new Event(LOGIN_EVENT));
}

export function onLogin(handler: () => void): () => void {
  window.addEventListener(LOGIN_EVENT, handler);
  return () => window.removeEventListener(LOGIN_EVENT, handler);
}
