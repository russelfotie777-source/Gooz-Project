import { describe, expect, test } from "vitest";
import {
  dealDayIndex,
  discountPercent,
  msUntilDealReset,
  pickDailyDeals,
  pickShowcaseCategories,
  topCategoryIds,
} from "@/lib/homeSelection";
import type { Category, Product } from "@/lib/types";

function product(id: number, base: number, promo: number | null, categoryIds: number[] = []): Product {
  return {
    id,
    categories: categoryIds.map((cid) => ({ id: cid }) as Category),
    variants: [
      {
        base_price: base,
        promo_price: promo,
        is_promotion: promo !== null,
        price: promo ?? base,
      },
    ],
  } as unknown as Product;
}

function category(id: number, count?: number): Category {
  return { id, products_count: count } as Category;
}

describe("discountPercent", () => {
  test("rounds the displayed variant's discount", () => {
    expect(discountPercent(product(1, 10000, 7000))).toBe(30);
  });

  test("is 0 when not on promotion", () => {
    expect(discountPercent(product(1, 10000, null))).toBe(0);
  });
});

describe("deal day", () => {
  // 2026-11-19T22:59:59Z is 23:59:59 in Douala (UTC+1).
  const beforeMidnight = Date.UTC(2026, 10, 19, 22, 59, 59);

  test("rotates at Douala midnight, not UTC midnight", () => {
    expect(dealDayIndex(beforeMidnight + 1000)).toBe(dealDayIndex(beforeMidnight) + 1);
  });

  test("counts down to Douala midnight", () => {
    expect(msUntilDealReset(beforeMidnight)).toBe(1000);
  });
});

describe("pickDailyDeals", () => {
  const deals = Array.from({ length: 10 }, (_, i) => product(i + 1, 10000, 10000 - (i + 1) * 500));

  test("orders by biggest discount and skips non-promo products", () => {
    const picked = pickDailyDeals([product(99, 5000, null), ...deals], 0, 20);
    expect(picked[0].id).toBe(10);
    expect(picked.some((p) => p.id === 99)).toBe(false);
  });

  test("changes the selection from one day to the next", () => {
    const today = pickDailyDeals(deals, 0, 4, 10).map((p) => p.id);
    const tomorrow = pickDailyDeals(deals, 1, 4, 10).map((p) => p.id);
    expect(today).not.toEqual(tomorrow);
    expect(tomorrow).toHaveLength(4);
  });
});

describe("pickShowcaseCategories", () => {
  test("keeps the biggest categories above the threshold", () => {
    const picked = pickShowcaseCategories([category(1, 3), category(2, 40), category(3, 12), category(4)], 3, 6);
    expect(picked.map((c) => c.id)).toEqual([2, 3]);
  });
});

describe("topCategoryIds", () => {
  test("ranks categories by how often they were viewed", () => {
    const viewed = [product(1, 1, null, [5]), product(2, 1, null, [7, 5]), product(3, 1, null, [7]), product(4, 1, null, [5])];
    expect(topCategoryIds(viewed, 2)).toEqual([5, 7]);
  });
});
