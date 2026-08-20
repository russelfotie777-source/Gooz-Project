"use client";

import { usePathname } from "next/navigation";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./BottomNav.module.css";

type ActiveSlot = "home" | "cart" | "bell" | "profile";

interface BottomNavProps {
  /** Which slot is raised as the active orange circle. Defaults to a value
   * derived from the current URL (see deriveActiveFromPathname) rather than
   * always "home" — a page that forgets to pass this explicitly used to
   * silently show the wrong tab as active instead of a reasonable guess. */
  active?: ActiveSlot;
}

function deriveActiveFromPathname(pathname: string): ActiveSlot {
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

  const SLOTS = [
    {
      key: "home",
      href: "/",
      icon: "/icon/bottom-nav/nav-home-inline.svg",
      activeIcon: "/icon/bottom-nav/nav-home.svg",
      label: dict.bottomNav.home,
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
  const circlePosition = `${(activeIndex * 2 + 1) * 12.5}%`;

  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      <div className={styles.barWrapper}>
        <div className={styles.bar}>
          <img
            src="/icon/bottom-nav/nav-shadow.svg"
            alt=""
            className={styles.homeShadow}
            style={{ left: circlePosition }}
            aria-hidden
          />

          {SLOTS.map((slot, index) =>
            index === activeIndex ? (
              <div key={slot.key} className={styles.homeSlot} aria-hidden />
            ) : (
              <LocaleLink key={slot.key} href={slot.href} className={styles.item} aria-label={slot.label}>
                <img src={slot.icon} alt="" className={styles.icon} />
              </LocaleLink>
            )
          )}
        </div>

        <LocaleLink
          href={activeSlot.href}
          className={styles.homeCircle}
          style={{ left: circlePosition }}
          aria-label={activeSlot.label}
          aria-current="page"
        >
          <img src={activeSlot.activeIcon} alt="" className={styles.homeIcon} />
        </LocaleLink>
      </div>
    </nav>
  );
}
