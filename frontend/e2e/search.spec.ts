import { expect, test } from "@playwright/test";

test.describe("search", () => {
  test("submitting the header search bar navigates to results for that query", async ({ page, request }) => {
    // Turbopack (dev mode) compiles each route on its first request — see
    // checkout.spec.ts for why this is worth doing up front.
    await request.get("/fr/recherche?q=Cuisiniere", { timeout: 120_000 });

    await page.goto("/fr");

    // exact: true matters here — the mobile header's own search input has
    // near-identical placeholder text with a trailing "..." ("Rechercher un
    // produit..."), which a substring match would also pick up regardless
    // of that input being display:none at this (desktop) viewport width;
    // getByPlaceholder matches against the DOM either way, visibility only
    // affects whether you can then click/fill what it found.
    const searchBox = page.getByPlaceholder("Rechercher un produit", { exact: true });
    await expect(searchBox).toBeVisible({ timeout: 30_000 });
    await searchBox.fill("Cuisinière");
    // Not the "Rechercher" submit button — the mobile header's search-icon
    // button carries the exact same accessible name (dict.header.search),
    // so pressing Enter in the input submits the (desktop) form it actually
    // belongs to without needing to disambiguate two same-named buttons.
    await searchBox.press("Enter");

    await expect(page).toHaveURL(/\/recherche\?q=Cuisini%C3%A8re/);
    await expect(page.getByRole("heading", { name: /Cuisinière/ })).toBeVisible({ timeout: 30_000 });
    // The seeded product itself, actually returned by the search API — not
    // just an empty results page that happens to echo the query back.
    await expect(page.getByText("Cuisinière", { exact: true }).first()).toBeVisible();
  });

  test("a query with no matches shows the empty state, not a crash", async ({ page, request }) => {
    await request.get("/fr/recherche?q=zzznoresultzzz", { timeout: 120_000 });

    await page.goto("/fr/recherche?q=zzznoresultzzz");

    await expect(page.getByText("Aucun produit ne correspond à votre recherche.")).toBeVisible({ timeout: 30_000 });
  });
});
