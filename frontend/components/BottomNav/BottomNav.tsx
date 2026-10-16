"use client";

import { useEffect, useRef, useState, ViewTransition } from "react";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./BottomNav.module.css";

// Ignores sub-10px jitter (momentum scrolling fires a lot of tiny-delta
// events) so the bar doesn't flicker — only a real scroll-up/scroll-down
// gesture flips it.
const SCROLL_DIRECTION_THRESHOLD = 10;
// Always shown this close to the top — hiding it the instant the page
// starts scrolling, before the shopper has gone anywhere, reads as broken
// rather than intentional.
const ALWAYS_VISIBLE_BELOW_Y = 24;

type ActiveSlot = "home" | "store" | "cart" | "bell" | "profile";

interface BottomNavProps {
  /** Which slot is raised as the active orange circle. Defaults to a value
   * derived from the current URL (see deriveActiveFromPathname) rather than
   * always "home" — a page that forgets to pass this explicitly used to
   * silently show the wrong tab as active instead of a reasonable guess. */
  active?: ActiveSlot;
}

function deriveActiveFromPathname(pathname: string): ActiveSlot {
  if (/\/boutique(\/|$)/.test(pathname)) return "store";
  if (/\/cart(\/|$)/.test(pathname)) return "cart";
  if (/\/notifications(\/|$)/.test(pathname)) return "bell";
  if (/\/(compte|adresses|commandes)(\/|$)/.test(pathname)) return "profile";
  return "home";
}

// Real mobile nav bar from Figma (node 372:242, frame 372:185) — floating
// orange circular button raised above a white pill bar, with plain icons
// alongside (no text labels). The cart page (node 538:336) raises the
// "Panier" slot instead of "Accueil", so whichever slot is active moves
// into the floating circle and the rest render inline in the bar.
// Each slot has two icon variants: "icon" (dark, used inline in the white
// bar) and "activeIcon" (white, used when raised into the orange circle) —
// the two states use differently-colored exports in Figma, not just CSS.
export default function BottomNav({ active }: BottomNavProps) {
  const dict = useDictionary();
  const pathname = usePathname();
  const resolvedActive = active ?? deriveActiveFromPathname(pathname);

  // Scrolling down hides the bar (more room to read), scrolling back up
  // brings it straight back — the direction is relative to the last point
  // a show/hide decision was made (lastDecisionY), not frame-to-frame, so a
  // slow continuous scroll in one direction doesn't need to "build up" any
  // momentum before the bar reacts.
  const [hidden, setHidden] = useState(false);
  const lastDecisionY = useRef(0);

  useEffect(() => {
    lastDecisionY.current = window.scrollY;
    let rafId = 0;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const y = window.scrollY;

        if (y < ALWAYS_VISIBLE_BELOW_Y) {
          setHidden(false);
          lastDecisionY.current = y;
          return;
        }

        const delta = y - lastDecisionY.current;
        if (Math.abs(delta) < SCROLL_DIRECTION_THRESHOLD) return;

        setHidden(delta > 0);
        lastDecisionY.current = y;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const SLOTS = [
    {
      key: "home",
      href: "/",
      icon: "/icon/bottom-nav/nav-home-inline.svg",
      activeIcon: "/icon/bottom-nav/nav-home.svg",
      label: dict.bottomNav.home,
    },
    {
      key: "store",
      href: "/boutique",
      // No separate white "active" export for this one — same situation as
      // "bell" below (a dark icon sitting in the orange circle reads fine
      // either way, see that slot's own icon/activeIcon).
      icon: "/icon/checkout/storefront.svg",
      activeIcon: "/icon/checkout/storefront.svg",
      label: dict.bottomNav.store,
    },
    {
      key: "cart",
      href: "/cart",
      icon: "/icon/bottom-nav/nav-cart.svg",
      activeIcon: "/icon/bottom-nav/nav-cart-active.svg",
      label: dict.bottomNav.cart,
    },
    {
      key: "bell",
      href: "/notifications",
      icon: "/icon/bottom-nav/nav-bell.svg",
      activeIcon: "/icon/bottom-nav/nav-bell.svg",
      label: dict.bottomNav.notifications,
    },
    {
      key: "profile",
      href: "/compte",
      icon: "/icon/bottom-nav/nav-user.svg",
      activeIcon: "/icon/bottom-nav/nav-user-active.svg",
      label: dict.bottomNav.account,
    },
  ] as const;

  const activeIndex = SLOTS.findIndex((slot) => slot.key === resolvedActive);
  const activeSlot = SLOTS[activeIndex];
  // Center of whichever slot is active, as a percentage of the bar's width
  // — generalized from a hardcoded "4 even slots" (each 25% wide) so adding
  // the "store" slot didn't need its own magic numbers.
  const circlePosition = `${((activeIndex + 0.5) / SLOTS.length) * 100}%`;

  return (
    <nav className={`${styles.nav} ${hidden ? styles.navHidden : ""}`} aria-label="Navigation principale">
      <div className={styles.barWrapper}>
        <div className={styles.bar}>
          {/* Every tab is its own page (Home/Boutique/Panier/Notifications/
              Compte each render their own BottomNav), so switching tabs is
              always a real navigation — the old bar's DOM is gone before
              the new one exists, which is exactly why a plain CSS
              transition never had anything to animate between. Giving the
              circle/shadow/each flat icon a stable name here, matched by
              the identical name on every other page's BottomNav, is what
              lets the browser's View Transitions API (see next.config.ts)
              morph the old page's element into the new page's one even
              though they're two different DOM nodes across a navigation. */}
          <ViewTransition name="bottom-nav-shadow">
            <img
              src="/icon/bottom-nav/nav-shadow.svg"
              alt=""
              className={styles.homeShadow}
              style={{ left: circlePosition }}
              aria-hidden
            />
          </ViewTransition>

          {/* Every slot keeps a real (if currently invisible) icon sitting
              flat in the bar, including the active one — previously that
              slot rendered an empty placeholder instead. The outgoing tab's
              flat icon fades back in as the circle leaves it (reads as
              "coming back down"), and the incoming tab's fades out as the
              circle arrives (reads as "going up into the circle") — see
              .itemActive's opacity transition. */}
          {SLOTS.map((slot, index) => (
            <ViewTransition key={slot.key} name={`bottom-nav-item-${slot.key}`}>
              <LocaleLink
                href={slot.href}
                className={`${styles.item} ${index === activeIndex ? styles.itemActive : ""}`}
                aria-label={slot.label}
                aria-current={index === activeIndex ? "page" : undefined}
              >
                <img src={slot.icon} alt="" className={styles.icon} />
              </LocaleLink>
            </ViewTransition>
          ))}
        </div>

        <ViewTransition name="bottom-nav-circle">
          <LocaleLink
            href={activeSlot.href}
            className={styles.homeCircle}
            style={{ left: circlePosition }}
            aria-label={activeSlot.label}
            aria-current="page"
          >
            <img src={activeSlot.activeIcon} alt="" className={styles.homeIcon} />
          </LocaleLink>
        </ViewTransition>
      </div>
    </nav>
  );
}
