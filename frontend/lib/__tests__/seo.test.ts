import { describe, expect, test } from "vitest";
import { canonicalAlternates, hreflangAlternates, localizedPath, NOINDEX } from "@/lib/seo";

describe("localizedPath", () => {
  test("returns the bare /{lang} for an empty path (home)", () => {
    expect(localizedPath("fr", "")).toBe("/fr");
  });

  test("prefixes a real path with /{lang}/", () => {
    expect(localizedPath("en", "categories/tv")).toBe("/en/categories/tv");
  });
});

describe("hreflangAlternates", () => {
  test("builds one entry per configured locale, all pointing at the same path", () => {
    expect(hreflangAlternates("products/42-iphone")).toEqual({
      fr: "/fr/products/42-iphone",
      en: "/en/products/42-iphone",
    });
  });

  test("still returns every locale for the home path", () => {
    expect(hreflangAlternates("")).toEqual({ fr: "/fr", en: "/en" });
  });
});

describe("canonicalAlternates", () => {
  test("pairs the canonical URL for the given lang with every hreflang alternate", () => {
    expect(canonicalAlternates("en", "categories/tv")).toEqual({
      canonical: "/en/categories/tv",
      languages: { fr: "/fr/categories/tv", en: "/en/categories/tv" },
    });
  });
});

describe("NOINDEX", () => {
  test("is a plain no-index, no-follow directive", () => {
    expect(NOINDEX).toEqual({ index: false, follow: false });
  });
});
