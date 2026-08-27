import { expect, test } from "@playwright/test";

// Matches frontend/.env.local's NEXT_PUBLIC_API_URL. Cart mutations here go
// through the real UI (that's the point of this test) — only the account +
// initial cart item are seeded via the API directly, same reasoning as
// checkout.spec.ts: arrange steps aren't what's under test.
const API_BASE = "http://127.0.0.1:8001/api/v1";

// Seeded product+variant with real stock — product id 1 "Cuisinière",
// variant id 1 ("40", 5 in stock) as of writing. If this ever gets
// deleted/deactivated, swap both ids for another in-stock pair.
const PRODUCT_ID = 1;
const VARIANT_ID = 1;

test.describe("cart", () => {
  test("a shopper can change an item's quantity and then remove it", async ({ page, request }) => {
    const phone = `6${Date.now().toString().slice(-8)}`;
    const registerRes = await request.post(`${API_BASE}/register`, {
      data: { name: "Test Panier", phone, password: "password123", password_confirmation: "password123" },
    });
    expect(registerRes.ok(), await registerRes.text()).toBeTruthy();
    const { user, token } = await registerRes.json();

    const cartRes = await request.post(`${API_BASE}/cart/items`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: PRODUCT_ID, product_variant_id: VARIANT_ID, quantity: 2 },
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

    // Class-substring, not text — CartItems.module.css's .quantityValue is
    // the one span whose only job is showing the current quantity, unlike a
    // bare text match which could collide with anything else on the page
    // that happens to render the digit "2".
    const quantityValue = page.locator('[class*="quantityValue"]');
    await expect(quantityValue).toHaveText("2", { timeout: 30_000 });

    await page.getByRole("button", { name: "Diminuer la quantité" }).click();
    await expect(quantityValue).toHaveText("1", { timeout: 15_000 });

    await page.getByRole("button", { name: "Supprimer" }).click();
    await expect(page.getByText("Retirer cet article du panier ?")).toBeVisible();
    await page.getByRole("button", { name: "Oui, retirer" }).click();

    await expect(page.getByText("Votre panier est vide.")).toBeVisible({ timeout: 15_000 });
  });
});
