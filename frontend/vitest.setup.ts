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
