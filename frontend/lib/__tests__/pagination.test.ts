import { describe, expect, test } from "vitest";
import { parsePageParam } from "@/lib/pagination";

describe("parsePageParam", () => {
  test("defaults to 1 when the param is missing", () => {
    expect(parsePageParam(undefined)).toBe(1);
  });

  test("parses a valid page number", () => {
    expect(parsePageParam("3")).toBe(3);
  });

  test("rejects zero, negative, decimal, and non-numeric values back to 1", () => {
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("-2")).toBe(1);
    expect(parsePageParam("2.5")).toBe(1);
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam("")).toBe(1);
  });
});
