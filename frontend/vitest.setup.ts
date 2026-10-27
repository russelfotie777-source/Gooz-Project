import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest.config.mts doesn't set test.globals: true (keeping describe/test/
// expect explicit imports everywhere), which also means React Testing
// Library can't auto-register its usual cleanup-after-each-test hook —
// without this, every test after the first in a file renders on top of the
// previous test's leftover DOM.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia at all — any component checking
// prefers-reduced-motion/-color-scheme/breakpoints (BrandsSection,
// AnnouncementBar, HeroBanner, ...) throws without this. Reports no match
// and no-op listeners by default; tests that care about a specific
// preference override window.matchMedia themselves for that one test.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
