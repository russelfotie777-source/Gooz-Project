import { expect, type Locator, type Page, test } from "@playwright/test";

// Matches frontend/.env.local's NEXT_PUBLIC_API_URL.
const API_BASE = "http://127.0.0.1:8001/api/v1";

function uniquePhone(): string {
  return `6${Date.now().toString().slice(-8)}`;
}

// AuthMobileFlow renders in the same DOM as AuthDesktopPage (CSS hides it
// at desktop widths, but that's irrelevant here: getByLabel/getByRole match
// against the DOM regardless of display:none — visibility only matters once
// you try to click/fill something, not for whether a locator resolves to
// it). AuthDesktopPage is rendered second in page.tsx and is always exactly
// one <form>, so scoping to the last <form> on the page reliably lands on
// its copy no matter how many forms AuthMobileFlow's own swipeable slides
// happen to contain.
function desktopForm(page: Page): Locator {
  return page.locator("form").last();
}

test.describe("auth", () => {
  test("a new shopper can register through the real form and lands on their account page", async ({
    page,
    request,
  }) => {
    // Turbopack (dev mode) compiles each route on its first request — see
    // checkout.spec.ts for the full story on why this is worth doing
    // up front rather than inside the timing-sensitive part of the test.
    await request.get("/fr/inscription", { timeout: 120_000 });

    await page.goto("/fr/inscription");

    const phone = uniquePhone();
    const form = desktopForm(page);

    await form.getByLabel("Nom complet").fill("Nouvelle Cliente");
    await form.getByLabel("Numéro de téléphone").fill(phone);
    await form.getByLabel(/^\*?Mot de passe$/).fill("password123");
    await form.getByLabel("Confirmer le mot de passe").fill("password123");

    await form.getByRole("button", { name: "S'inscrire" }).click();

    await expect(page.getByRole("heading", { name: "Profil" })).toBeVisible({ timeout: 30_000 });

    // Confirms it's a real, persisted session — not just a client-side
    // redirect with nothing behind it.
    const registered = await request
      .post(`${API_BASE}/login`, { data: { phone, password: "password123" } })
      .then((res) => res.ok());
    expect(registered).toBe(true);
  });

  test("an existing shopper can log in through the real form", async ({ page, request }) => {
    const phone = uniquePhone();
    const registerRes = await request.post(`${API_BASE}/register`, {
      data: {
        name: "Cliente Existante",
        phone,
        password: "password123",
        password_confirmation: "password123",
      },
    });
    expect(registerRes.ok(), await registerRes.text()).toBeTruthy();

    await request.get("/fr/connexion", { timeout: 120_000 });
    await page.goto("/fr/connexion");

    const form = desktopForm(page);
    await form.getByLabel("Numéro de téléphone").fill(phone);
    await form.getByLabel(/^\*?Mot de passe$/).fill("password123");
    await form.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByRole("heading", { name: "Profil" })).toBeVisible({ timeout: 30_000 });
  });

  test("a wrong password is rejected with a visible error, no redirect", async ({ page, request }) => {
    const phone = uniquePhone();
    const registerRes = await request.post(`${API_BASE}/register`, {
      data: {
        name: "Cliente Test",
        phone,
        password: "password123",
        password_confirmation: "password123",
      },
    });
    expect(registerRes.ok(), await registerRes.text()).toBeTruthy();

    await page.goto("/fr/connexion");

    const form = desktopForm(page);
    await form.getByLabel("Numéro de téléphone").fill(phone);
    await form.getByLabel(/^\*?Mot de passe$/).fill("wrong-password");
    await form.getByRole("button", { name: "Se connecter" }).click();

    await expect(form.getByRole("alert")).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/connexion/);
  });
});
