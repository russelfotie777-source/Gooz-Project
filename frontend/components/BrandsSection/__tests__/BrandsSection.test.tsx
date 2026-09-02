import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import type { Brand } from "@/lib/types";
import BrandsSection from "@/components/BrandsSection/BrandsSection";

function makeBrand(overrides: Partial<Brand> = {}): Brand {
  return {
    id: 1,
    name: "Tenda",
    slug: "tenda",
    logo: "https://example.com/tenda.png",
    description: null,
    country_origin: null,
    ...overrides,
  };
}

function renderSection(brands: Brand[]) {
  return render(
    <I18nProvider lang="fr">
      <BrandsSection brands={brands} />
    </I18nProvider>
  );
}

describe("BrandsSection", () => {
  test("renders nothing when there are no brands", () => {
    const { container } = renderSection([]);
    expect(container).toBeEmptyDOMElement();
  });

  test("renders each brand's logo with its name as alt text", () => {
    renderSection([makeBrand({ id: 1, name: "Tenda" }), makeBrand({ id: 2, name: "Dangote", logo: null })]);

    expect(screen.getAllByAltText("Tenda").length).toBeGreaterThan(0);
    // Brand with no logo falls back to its name rendered as text instead of a broken <img>.
    expect(screen.getAllByText("Dangote").length).toBeGreaterThan(0);
  });

  test("duplicates the logo strip for a seamless marquee loop", () => {
    renderSection([makeBrand({ id: 1, name: "Tenda" })]);
    // One visible copy + one aria-hidden duplicate for the CSS marquee.
    expect(screen.getAllByAltText("Tenda")).toHaveLength(2);
  });
});
