"use client";

import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./BottomNav.module.css";

interface BottomNavProps {
  /** Which slot is raised as the active orange circle. Defaults to "home". */
  active?: "home" | "cart" | "profile";
}

// Real mobile nav bar from Figma (node 372:242, frame 372:185) — floating
// orange circular button raised above a white pill bar, with plain icons
// alongside (no text labels). The cart page (node 538:336) raises the
// "Panier" slot instead of "Accueil", so whichever slot is active moves
// into the floating circle and the rest render inline in the bar.
// Each slot has two icon variants: "icon" (dark, used inline in the white
// bar) and "activeIcon" (white, used when raised into the orange circle) —
// the two states use differently-colored exports in Figma, not just CSS.
export default function BottomNav({ active = "home" }: BottomNavProps) {
  const dict = useDictionary();

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
      href: null,
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

  const activeIndex = SLOTS.findIndex((slot) => slot.key === active);
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
            ) : slot.href ? (
              <LocaleLink key={slot.key} href={slot.href} className={styles.item} aria-label={slot.label}>
                <img src={slot.icon} alt="" className={styles.icon} />
              </LocaleLink>
            ) : (
              <button key={slot.key} type="button" className={styles.item} aria-label={slot.label}>
                <img src={slot.icon} alt="" className={styles.icon} />
              </button>
            )
          )}
        </div>

        {activeSlot.href ? (
          <LocaleLink
            href={activeSlot.href}
            className={styles.homeCircle}
            style={{ left: circlePosition }}
            aria-label={activeSlot.label}
            aria-current="page"
          >
            <img src={activeSlot.activeIcon} alt="" className={styles.homeIcon} />
          </LocaleLink>
        ) : (
          <button
            type="button"
            className={styles.homeCircle}
            style={{ left: circlePosition }}
            aria-label={activeSlot.label}
            aria-current="page"
          >
            <img src={activeSlot.activeIcon} alt="" className={styles.homeIcon} />
          </button>
        )}
      </div>
    </nav>
  );
}
