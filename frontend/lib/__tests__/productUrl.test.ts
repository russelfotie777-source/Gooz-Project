import { describe, expect, test } from "vitest";
import { productPath } from "@/lib/productUrl";

describe("productPath", () => {
  test("builds an id-slug URL when a slug is present", () => {
    expect(productPath({ id: 42, slug: "iphone-15" })).toBe("/products/42-iphone-15");
  });

  test("falls back to a bare numeric id when there is no slug", () => {
    expect(productPath({ id: 42, slug: "" })).toBe("/products/42");
    expect(productPath({ id: 42 })).toBe("/products/42");
  });
});
