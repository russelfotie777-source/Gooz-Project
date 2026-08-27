import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import type { Announcement } from "@/lib/types";
import AnnouncementBar from "@/components/AnnouncementBar/AnnouncementBar";

const BRAND_TEXT = "Shopitech — Paiement Mobile Money sécurisé • Livraison partout au Cameroun";

function renderBar(props: Partial<React.ComponentProps<typeof AnnouncementBar>> = {}) {
  const onDismiss = vi.fn();
  const utils = render(
    <I18nProvider lang="fr">
      <AnnouncementBar
        announcements={props.announcements ?? []}
        dismissed={props.dismissed ?? false}
        variant={props.variant ?? "desktop"}
        onDismiss={props.onDismiss ?? onDismiss}
      />
    </I18nProvider>
  );
  return { ...utils, onDismiss };
}

function makeAnnouncement(overrides: Partial<Announcement> = {}): Announcement {
  return {
    id: 1,
    text: "Livraison gratuite ce week-end",
    icon: "🚚",
    link_url: null,
    position: 1,
    ...overrides,
  };
}

describe("AnnouncementBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("always shows the hardcoded brand slide, even with zero admin announcements", () => {
    renderBar({ announcements: [] });
    expect(screen.getByText(BRAND_TEXT)).toBeInTheDocument();
  });

  test("renders nothing at all once dismissed", () => {
    const { container } = renderBar({ dismissed: true, announcements: [makeAnnouncement()] });
    expect(container).toBeEmptyDOMElement();
  });

  test("the dismiss button calls onDismiss", () => {
    const { onDismiss } = renderBar();
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("extracts a percentage into its own promo pill without removing it from the text", () => {
    renderBar({ announcements: [makeAnnouncement({ text: "Jusqu'à -20% sur les écouteurs" })] });
    // The brand slide is always first (index 0) — jump to the admin slide
    // (index 1) via the manual "next" control rather than waiting out its
    // auto-advance timer.
    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getAllByText("-20%").length).toBeGreaterThan(0);
    expect(screen.getByText("Jusqu'à -20% sur les écouteurs")).toBeInTheDocument();
  });

  test("an announcement with a link_url renders as a clickable external link", () => {
    renderBar({
      announcements: [makeAnnouncement({ text: "Voir la promo", link_url: "https://example.com/promo" })],
    });
    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const link = screen.getByRole("link", { name: /Voir la promo/ });
    expect(link).toHaveAttribute("href", "https://example.com/promo");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  test("desktop with more than one slide shows manual prev/next controls, mobile never does", () => {
    const announcements = [makeAnnouncement()];
    const { unmount } = renderBar({ announcements, variant: "desktop" });
    expect(screen.getByRole("button", { name: "Suivant" })).toBeInTheDocument();
    unmount();

    renderBar({ announcements, variant: "mobile" });
    expect(screen.queryByRole("button", { name: "Suivant" })).not.toBeInTheDocument();
  });

  test("auto-rotates from the brand slide into an admin announcement over time", () => {
    renderBar({ announcements: [makeAnnouncement({ text: "Nouvelle collection dispo" })] });
    expect(screen.getByText(BRAND_TEXT)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000); // past even the longest possible slide duration
    });
    act(() => {
      vi.advanceTimersByTime(500); // past the exit/enter handoff
    });

    expect(screen.getByText("Nouvelle collection dispo")).toBeInTheDocument();
    expect(screen.queryByText(BRAND_TEXT)).not.toBeInTheDocument();
  });

  test("hovering the bar pauses auto-rotation", () => {
    const { container } = renderBar({ announcements: [makeAnnouncement({ text: "Nouvelle collection dispo" })] });
    const bar = container.firstElementChild as HTMLElement;

    fireEvent.mouseEnter(bar);
    act(() => {
      vi.advanceTimersByTime(6000);
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText(BRAND_TEXT)).toBeInTheDocument();
  });

  test("clicking the next control manually advances the slide", () => {
    renderBar({ announcements: [makeAnnouncement({ text: "Nouvelle collection dispo" })] });

    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText("Nouvelle collection dispo")).toBeInTheDocument();
  });
});
