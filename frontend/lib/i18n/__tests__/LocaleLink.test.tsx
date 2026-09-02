import { describe, expect, test } from "vitest";
import { localizeHref } from "@/lib/i18n/LocaleLink";

describe("localizeHref", () => {
  test("prefixes a plain internal path with the current locale", () => {
    expect(localizeHref("/cart", "fr")).toBe("/fr/cart");
    expect(localizeHref("/products/5", "en")).toBe("/en/products/5");
  });

  test("leaves an href already prefixed with the current locale untouched", () => {
    expect(localizeHref("/en/cart", "en")).toBe("/en/cart");
  });

  test("prefixes a href that's prefixed with a DIFFERENT locale with the current one too", () => {
    // Only the current lang's own prefix is recognized — a stale/foreign
    // locale prefix is just more path, not a signal to skip.
    expect(localizeHref("/en/cart", "fr")).toBe("/fr/en/cart");
  });

  test("leaves the bare locale root untouched", () => {
    expect(localizeHref("/fr", "fr")).toBe("/fr");
  });

  test("leaves the locale root untouched even with a query string or hash attached", () => {
    // Regression: used to double-prefix to "/fr/fr?page=2" — the bare
    // locale-root + query string shape didn't match either the exact-match
    // or the startsWith("/fr/") check (see CatalogueSection/CategoryResults'
    // paginated links, which are exactly this shape).
    expect(localizeHref("/fr?page=2", "fr")).toBe("/fr?page=2");
    expect(localizeHref("/en?page=3", "en")).toBe("/en?page=3");
    expect(localizeHref("/fr#catalogue", "fr")).toBe("/fr#catalogue");
  });

  test("still prefixes a query string on a non-root path missing its locale", () => {
    expect(localizeHref("/categories/tv?page=2", "fr")).toBe("/fr/categories/tv?page=2");
  });

  test("passes through external URLs and same-page anchors unmodified", () => {
    expect(localizeHref("https://example.com", "fr")).toBe("https://example.com");
    expect(localizeHref("#catalogue", "fr")).toBe("#catalogue");
  });
});
