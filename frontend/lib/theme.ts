export type Theme = "light" | "dark";

// Same rationale as lib/auth.ts's STORAGE_KEY: a plain client preference,
// no server round-trip needed (unlike the locale, which is read server-side
// for routing — see lib/i18n/LocaleLink.tsx / the shopitech-locale cookie).
const STORAGE_KEY = "shopitech-theme";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function getStoredTheme(): Theme | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return isTheme(raw) ? raw : null;
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// No stored preference yet (first visit, or storage was cleared) falls back
// to the OS setting rather than hardcoding "light" — matches the anti-flash
// script in app/[lang]/layout.tsx, which must resolve the theme the exact
// same way before the stylesheet paints.
export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? systemTheme();
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

// Reads the attribute the anti-flash script already set before hydration —
// shared by every component that needs to know/toggle the current theme
// (ThemeToggle, ProfilePage's own theme button) so they don't each
// reimplement the same server/client guard.
export function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
