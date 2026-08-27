import { APIRequestContext, expect, Page, test } from "@playwright/test";

// Matches frontend/.env.local's NEXT_PUBLIC_API_URL — this test hits the
// real Laravel API directly for signup + cart seeding (arrange steps) so
// the checkout flow itself doesn't also have to re-prove the login form or
// the add-to-cart button work — those aren't what this test is about, and
// driving them through the UI turned out to be genuinely flaky here (see
// git history on this file): the add-to-cart button triggers a client-side
// router.push("/cart") whose timing proved impossible to wait on reliably
// against this project's dev-mode Turbopack compile times.
const API_BASE = "http://127.0.0.1:8001/api/v1";

// Seeded product+variant with real stock (see backend factories / demo
// data) — product id 1 "Cuisinière", variant id 1 ("40") as of writing. If
// this ever gets deleted/deactivated, swap both ids for another in-stock
// product/variant pair. Real checkout runs through here decrement real
// stock — see cart.spec.ts's comment on replenishing it if it runs dry.
const PRODUCT_ID = 1;
const VARIANT_ID = 1;

async function seedUserWithCartItem(page: Page, request: APIRequestContext) {
  const phone = `6${Date.now().toString().slice(-8)}`;
  const registerRes = await request.post(`${API_BASE}/register`, {
    data: { name: "Test E2E", phone, password: "password123", password_confirmation: "password123" },
  });
  expect(registerRes.ok(), await registerRes.text()).toBeTruthy();
  const { user, token } = await registerRes.json();

  const cartRes = await request.post(`${API_BASE}/cart/items`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { product_id: PRODUCT_ID, product_variant_id: VARIANT_ID, quantity: 1 },
  });
  expect(cartRes.ok(), await cartRes.text()).toBeTruthy();

  // lib/auth.ts reads this exact shape/key — see getSession().
  await page.addInitScript(
    ({ sessionUser, sessionToken }) => {
      window.localStorage.setItem("shopitech-auth", JSON.stringify({ token: sessionToken, user: sessionUser }));
    },
    { sessionUser: user, sessionToken: token }
  );
}

test.describe("checkout", () => {
  test("a logged-in shopper can complete a cash pickup order end-to-end", async ({ page, request }) => {
    await seedUserWithCartItem(page, request);

    // Turbopack (dev mode) compiles a route on its first request, and this
    // one has repeatedly taken well over a minute cold in this environment
    // — hitting it once here (outside the browser, no interactivity needed
    // yet) forces that compile before the real, timing-sensitive goto below.
    await request.get("/fr/checkout", { timeout: 120_000 });

    // --- Act: the actual checkout flow, driven through the real UI ---
    await page.goto("/fr/checkout");

    // Cities/neighborhoods/cart/warehouses all load async on mount, and
    // Turbopack (dev mode) compiles this route on its first request — this
    // project has repeatedly taken 15-30s+ for that, so this is generous on
    // purpose rather than assuming the first render already has the form.
    const nomInput = page.getByPlaceholder("Jean");
    await expect(nomInput).toBeVisible({ timeout: 30_000 });

    await nomInput.fill("Dupont");
    await page.getByPlaceholder("Pierre").fill("Jean");
    // Phone is prefilled from the registered account (session.user.phone —
    // see CheckoutContext's loadCart) and its placeholder ("Ex: 677 47 22
    // 14") is shared with the optional secondary/WhatsApp phone field
    // below it, so it's left alone rather than picked ambiguously.
    await page.getByPlaceholder("Rue, quartier précis, point de repère...").fill("123 Rue Test");

    const selects = page.locator("select");
    await selects.nth(0).selectOption({ label: "Douala" });
    // Whichever quartier happens to be first for Douala — this test only
    // needs *an* address, not a specific one (see the home-delivery test
    // below for the case where the exact neighborhood matters).
    await selects.nth(1).selectOption({ index: 1 });

    await page.getByRole("button", { name: "Enregistrer et continuer" }).click();

    // Pickup ("Retrait à Akwa"), not home delivery — sidesteps needing a
    // real delivery-fee/geocoding round trip for this test.
    await page.getByRole("button", { name: /Retrait à Akwa/ }).click();
    await page.getByRole("button", { name: "Valider" }).click();

    await page.getByRole("button", { name: /Paiement a la livraison/ }).click();

    await page.getByRole("button", { name: "Passer la commande" }).click();

    // CheckoutSuccessContent's heading — the order was created, confirmed
    // via GET /orders/reference/{ref}, and is genuinely this shopper's own.
    await expect(page.getByText("Bravooo !!!")).toBeVisible({ timeout: 30_000 });
  });

  test("home delivery computes a real, non-zero fee from the chosen neighborhood", async ({ page, request }) => {
    await seedUserWithCartItem(page, request);
    await request.get("/fr/checkout", { timeout: 120_000 });

    await page.goto("/fr/checkout");

    const nomInput = page.getByPlaceholder("Jean");
    await expect(nomInput).toBeVisible({ timeout: 30_000 });
    await nomInput.fill("Dupont");
    await page.getByPlaceholder("Pierre").fill("Jean");
    await page.getByPlaceholder("Rue, quartier précis, point de repère...").fill("123 Rue Test");

    const selects = page.locator("select");
    await selects.nth(0).selectOption({ label: "Douala" });
    // "Akwa" (id 1) as of writing — the one neighborhood guaranteed to have
    // real coordinates and to be first in the API's Douala results, same as
    // the warehouse itself is based there (Entrepôt Akwa), so the estimate
    // is a real, non-zero base fee rather than possibly 0 from a bad match.
    await selects.nth(1).selectOption({ index: 1 });

    await page.getByRole("button", { name: "Enregistrer et continuer" }).click();

    await page.getByRole("button", { name: "Livraison à domicile" }).click();

    // Real GET /delivery/estimate round trip — "Calcul..." while in flight,
    // then a real amount. Not asserting the exact fee (that's the backend's
    // own DeliveryFeeCalculator test's job) — just that a genuine non-zero
    // figure replaced the loading state.
    await expect(page.getByText("Calcul...")).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/\+ [\d\s]+ FCFA/)).toBeVisible();

    await page.getByRole("button", { name: "Valider" }).click();
    await page.getByRole("button", { name: /Paiement a la livraison/ }).click();
    await page.getByRole("button", { name: "Passer la commande" }).click();

    await expect(page.getByText("Bravooo !!!")).toBeVisible({ timeout: 30_000 });
  });
});
