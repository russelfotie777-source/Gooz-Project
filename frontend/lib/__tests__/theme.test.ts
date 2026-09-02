import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { applyTheme, currentTheme, getStoredTheme, resolveInitialTheme } from "@/lib/theme";

function mockMatchMedia(prefersDark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-color-scheme: dark)" && prefersDark,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("lib/theme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("getStoredTheme returns null when nothing was ever stored", () => {
    expect(getStoredTheme()).toBeNull();
  });

  test("getStoredTheme ignores garbage values instead of returning them as-is", () => {
    window.localStorage.setItem("shopitech-theme", "purple");
    expect(getStoredTheme()).toBeNull();
  });

  test("getStoredTheme returns a previously stored valid theme", () => {
    window.localStorage.setItem("shopitech-theme", "dark");
    expect(getStoredTheme()).toBe("dark");
  });

  test("resolveInitialTheme falls back to the OS preference with no stored value", () => {
    mockMatchMedia(true);
    expect(resolveInitialTheme()).toBe("dark");

    mockMatchMedia(false);
    expect(resolveInitialTheme()).toBe("light");
  });

  test("resolveInitialTheme prefers the stored choice over the OS preference", () => {
    mockMatchMedia(true);
    window.localStorage.setItem("shopitech-theme", "light");
    expect(resolveInitialTheme()).toBe("light");
  });

  test("applyTheme sets the html data-theme attribute and persists the choice", () => {
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("shopitech-theme")).toBe("dark");
  });

  test("currentTheme reads back whatever applyTheme just set", () => {
    applyTheme("dark");
    expect(currentTheme()).toBe("dark");

    applyTheme("light");
    expect(currentTheme()).toBe("light");
  });

  test("currentTheme defaults to light when no attribute has been set yet", () => {
    expect(currentTheme()).toBe("light");
  });
});
