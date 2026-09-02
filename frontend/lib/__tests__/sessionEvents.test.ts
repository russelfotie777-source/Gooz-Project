import { describe, expect, test, vi } from "vitest";
import { notifySessionExpired, onSessionExpired } from "@/lib/sessionEvents";

describe("sessionEvents", () => {
  test("a listener registered via onSessionExpired fires on notifySessionExpired", () => {
    const handler = vi.fn();
    const unsubscribe = onSessionExpired(handler);

    notifySessionExpired();

    expect(handler).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  test("unsubscribing stops further notifications from reaching the handler", () => {
    const handler = vi.fn();
    const unsubscribe = onSessionExpired(handler);
    unsubscribe();

    notifySessionExpired();

    expect(handler).not.toHaveBeenCalled();
  });
});
