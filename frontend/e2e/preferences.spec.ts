import { expect, test } from "@playwright/test";

test.describe("site preferences", () => {
  test("switching language actually changes the page content and URL", async ({ page, request }) => {
    // Turbopack (dev mode) compiles each route on its first request.
    await request.get("/en", { timeout: 120_000 });

    await page.goto("/fr");
    await expect(page.getByText("Mon compte")).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "FR" }).click();
    await page.getByRole("listbox").getByRole("button", { name: "ENG" }).click();

    await expect(page).toHaveURL(/\/en(\?|$)/);
    // Not just the URL — the actual dictionary content really switched.
    await expect(page.getByText("My account")).toBeVisible({ timeout: 30_000 });
  });

  test("toggling dark mode flips the html data-theme attribute and persists it", async ({ page }) => {
    await page.goto("/fr");

    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    await page.getByRole("button", { name: "Activer le mode sombre" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Persisted, not just an in-memory toggle — a fresh load should come
    // back up dark (see lib/theme.ts's anti-FOUC script in the root layout).
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark", { timeout: 15_000 });

    await page.getByRole("button", { name: "Activer le mode clair" }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
  });
});
