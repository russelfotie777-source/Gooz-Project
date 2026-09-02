import { describe, expect, test } from "vitest";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";

describe("i18n/config", () => {
  test("locales lists fr and en, with fr as the default", () => {
    expect(locales).toEqual(["fr", "en"]);
    expect(defaultLocale).toBe("fr");
  });

  test("isLocale accepts only configured locales", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
