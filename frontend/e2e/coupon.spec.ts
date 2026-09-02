import { expect, test } from "@playwright/test";

// Matches frontend/.env.local's NEXT_PUBLIC_API_URL.
const API_BASE = "http://127.0.0.1:8001/api/v1";

// Seeded product+variant with real stock — see checkout.spec.ts. The
// coupon itself ("E2ETEST10", 10% off) is created idempotently in
// global-setup.ts — there's no public endpoint to create one (admin-only).
const PRODUCT_ID = 1;
const VARIANT_ID = 1;

test.describe("coupon", () => {
  test("applying a valid coupon in the cart shows the discount", async ({ page, request }) => {
    const phone = `6${Date.now().toString().slice(-8)}`;
    const registerRes = await request.post(`${API_BASE}/register`, {
      data: { name: "Test Coupon", phone, password: "password123", password_confirmation: "password123" },
    });
    expect(registerRes.ok(), await registerRes.text()).toBeTruthy();
    const { user, token } = await registerRes.json();

    const cartRes = await request.post(`${API_BASE}/cart/items`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: PRODUCT_ID, product_variant_id: VARIANT_ID, quantity: 1 },
    });
    expect(cartRes.ok(), await cartRes.text()).toBeTruthy();

    await page.addInitScript(
      ({ sessionUser, sessionToken }) => {
        window.localStorage.setItem("shopitech-auth", JSON.stringify({ token: sessionToken, user: sessionUser }));
      },
      { sessionUser: user, sessionToken: token }
    );

    // Turbopack (dev mode) compiles each route on its first request — see
    // checkout.spec.ts for why this is worth doing up front.
    await request.get("/fr/cart", { timeout: 120_000 });
    await page.goto("/fr/cart");

    // The coupon panel starts open by default (CartItems' own couponOpen
    // state) — no need to click a toggle first.
    await expect(page.getByPlaceholder("Saisissez le code ici")).toBeVisible({ timeout: 30_000 });
    await page.getByPlaceholder("Saisissez le code ici").fill("E2ETEST10");
    await page.getByRole("button", { name: "Appliquer" }).click();

    await expect(page.getByText("Coupon appliqué !")).toBeVisible({ timeout: 15_000 });
    // The "Réduction" summary row only renders once discountAmount > 0 —
    // proves the discount was actually computed server-side, not just a
    // success toast with nothing behind it.
    // exact: true — "Réduction" is otherwise a case-insensitive substring
    // of the coupon toggle's own question text ("...coupon de réduction ?"),
    // which is always in the DOM regardless of whether a coupon is applied.
    await expect(page.getByText("Réduction", { exact: true })).toBeVisible();
  });

  test("an unknown coupon code shows an error, not a discount", async ({ page, request }) => {
    const phone = `6${Date.now().toString().slice(-8)}`;
    const registerRes = await request.post(`${API_BASE}/register`, {
      data: { name: "Test Coupon Invalide", phone, password: "password123", password_confirmation: "password123" },
    });
    expect(registerRes.ok(), await registerRes.text()).toBeTruthy();
    const { user, token } = await registerRes.json();

    const cartRes = await request.post(`${API_BASE}/cart/items`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: PRODUCT_ID, product_variant_id: VARIANT_ID, quantity: 1 },
    });
    expect(cartRes.ok(), await cartRes.text()).toBeTruthy();

    await page.addInitScript(
      ({ sessionUser, sessionToken }) => {
        window.localStorage.setItem("shopitech-auth", JSON.stringify({ token: sessionToken, user: sessionUser }));
      },
      { sessionUser: user, sessionToken: token }
    );

    await page.goto("/fr/cart");

    await expect(page.getByPlaceholder("Saisissez le code ici")).toBeVisible({ timeout: 30_000 });
    await page.getByPlaceholder("Saisissez le code ici").fill("DOES-NOT-EXIST");
    const validateResponse = page.waitForResponse((res) => res.url().includes("/coupons/validate"));
    await page.getByRole("button", { name: "Appliquer" }).click();
    const response = await validateResponse;

    expect(response.ok()).toBe(false);
    await expect(page.getByText("Coupon appliqué !")).not.toBeVisible();
    await expect(page.getByText("Réduction", { exact: true })).not.toBeVisible();
  });
});
