import { describe, expect, test, vi } from "vitest";
import { notifyCartUpdated, onCartUpdated } from "@/lib/cartEvents";

describe("cartEvents", () => {
  test("a listener registered via onCartUpdated receives the count from notifyCartUpdated", () => {
    const handler = vi.fn();
    const unsubscribe = onCartUpdated(handler);

    notifyCartUpdated(3);

    expect(handler).toHaveBeenCalledWith(3);
    unsubscribe();
  });

  test("unsubscribing stops further notifications from reaching the handler", () => {
    const handler = vi.fn();
    const unsubscribe = onCartUpdated(handler);
    unsubscribe();

    notifyCartUpdated(5);

    expect(handler).not.toHaveBeenCalled();
  });
});
