"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAnnouncements, getCart, logout as apiLogout } from "@/lib/api";
import { clearSession, getSession } from "@/lib/auth";
import { notifyCartUpdated, onCartUpdated } from "@/lib/cartEvents";
import type { Locale } from "@/lib/i18n/config";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { splitName } from "@/lib/name";
import { onSessionExpired } from "@/lib/sessionEvents";
import { showToast } from "@/lib/toast";
import type { Announcement, User } from "@/lib/types";
import AnnouncementBar from "@/components/AnnouncementBar/AnnouncementBar";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import styles from "./Header.module.css";

// Dismissing the announcement bar hides it for the rest of the browser
// session (not forever) — sessionStorage, not localStorage.
const ANNOUNCEMENT_DISMISSED_KEY = "shopitech-announcement-dismissed";

interface HeaderProps {
  cartCount?: number;
  /**
   * "detail" swaps the mobile row for back + title + search only (Figma node 223:189).
   * "cart" swaps it for back + title + info icon, no search bar (Figma node 538:336).
   * Desktop is unaffected by either.
   */
  variant?: "default" | "detail" | "cart";
}

const LANGUAGES = [
  { code: "fr" as Locale, label: "FR", Flag: FranceFlag },
  { code: "en" as Locale, label: "ENG", Flag: UkFlag },
];

export default function Header({ cartCount: cartCountProp = 0, variant = "default" }: HeaderProps) {
  const dict = useDictionary();
  const lang = useLang();
  const pathname = usePathname();
  const rawRouter = useRouter();
  const router = useLocaleRouter();

  const CATEGORIES = dict.header.quickCategories.map((label, i) => ({
    id: ["promotion", "best-seller-1", "best-seller-2", "electromenager", "securite", "informatique"][i],
    label,
    icon: [
      "/icon/header/promotion.svg",
      "/icon/header/best-seller-1.svg",
      "/icon/header/best-seller-2.svg",
      "/icon/header/electromenager.svg",
      "/icon/header/securite.svg",
      "/icon/header/informatique.svg",
    ][i],
  }));

  const [query, setQuery] = useState("");
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langWrapperRef = useRef<HTMLDivElement>(null);
  const activeLanguage = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  // Pages render this with a prop seeded from mock/server data (see e.g.
  // CartPage's comments). Once a real session exists, the actual cart count
  // is fetched here and kept in sync via the cartEvents pub/sub — cart
  // mutations happen in components (ProductDetail, CartItems) that have no
  // other relationship to Header, so a global event is simpler than
  // threading a cart store through every page that renders Header.
  const [cartCount, setCartCount] = useState(cartCountProp);
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsDismissed, setAnnouncementsDismissed] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    setUser(session.user);

    getCart(session.token)
      .then((cart) => setCartCount(cart.items.length))
      .catch(() => {});

    return onCartUpdated(setCartCount);
  }, []);

  useEffect(() => {
    getAnnouncements().then(setAnnouncements).catch(() => {});
    setAnnouncementsDismissed(sessionStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY) === "1");
  }, []);

  function dismissAnnouncements() {
    setAnnouncementsDismissed(true);
    sessionStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, "1");
  }

  // authedFetch (lib/api.ts) already clears the stored session on any 401 —
  // this just makes sure Header's own copy of that state (derived once on
  // mount, above) doesn't keep showing the account name/dropdown as if
  // nothing happened.
  useEffect(() => {
    return onSessionExpired(() => {
      setUser(null);
      setCartCount(0);
    });
  }, []);

  function handleLogout() {
    const session = getSession();
    if (session) apiLogout(session.token);
    clearSession();
    setUser(null);
    setCartCount(0);
    notifyCartUpdated(0);
    showToast(dict.session.loggedOut, "success");
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/recherche?q=${encodeURIComponent(trimmed)}`);
  }

  const userNameParts = user ? splitName(user.name) : null;
  const displayName = userNameParts
    ? userNameParts.prenom || userNameParts.nom || dict.header.myAccount
    : dict.header.myAccount;

  // Swaps only the leading /fr or /en segment of the current URL and
  // remembers the choice in a cookie so the proxy (proxy.ts) redirects here
  // next time too, instead of falling back to the browser's Accept-Language.
  function switchLanguage(newLang: Locale) {
    setLangOpen(false);
    if (newLang === lang) return;
    document.cookie = `shopitech-locale=${newLang}; path=/; max-age=31536000`;
    const rest = pathname.startsWith(`/${lang}`) ? pathname.slice(`/${lang}`.length) : pathname;
    rawRouter.push(`/${newLang}${rest || ""}`);
  }

  useEffect(() => {
    if (!langOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (langWrapperRef.current && !langWrapperRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langOpen]);

  useEffect(() => {
    if (variant !== "detail") return;

    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  return (
    <header className={styles.header}>
      {/* Desktop / tablet header — Figma node 1057:2032 */}
      <div className={styles.desktopHeader}>
        {/* Figma node 907:1140 was an empty placeholder slot — now filled by
            the admin-managed announcement bar. Scrolls away with the page;
            only the sticky wrapper below stays fixed. */}
        <AnnouncementBar
          announcements={announcements}
          dismissed={announcementsDismissed}
          variant="desktop"
          onDismiss={dismissAnnouncements}
        />

        <div className={styles.desktopSticky}>
          <div className={styles.mainRow}>
            <button type="button" className={styles.menuButton} aria-label={dict.header.menu}>
              <img src="/icon/header/hamburger.svg" alt="" className={styles.menuIcon} />
            </button>

            <LocaleLink href="/" aria-label={dict.header.catalogueTitle}>
              <img
                src="/logo-shopitech-primaire/logoFichier 16version F.png"
                alt="Shopitech"
                className={styles.logo}
              />
            </LocaleLink>

            <form className={styles.searchForm} role="search" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                placeholder={dict.header.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                {dict.header.searchButton}
              </button>
            </form>

            <div className={styles.actions}>
              <ThemeToggle className={styles.themeToggleDesktop} />

              <div className={styles.langWrapper} ref={langWrapperRef}>
                <button
                  type="button"
                  className={styles.langButton}
                  onClick={() => setLangOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                >
                  <activeLanguage.Flag className={styles.langFlag} />
                  <span>{activeLanguage.label}</span>
                  <img
                    src="/icon/product-detail/chevron-down.svg"
                    alt=""
                    className={`${styles.dropdownChevron} ${styles.chevronLight} ${langOpen ? styles.chevronOpen : ""}`}
                  />
                </button>

                {langOpen && (
                  <ul className={styles.langDropdown} role="listbox">
                    {LANGUAGES.map((l) => (
                      <li key={l.code}>
                        <button
                          type="button"
                          className={styles.langOption}
                          onClick={() => switchLanguage(l.code)}
                        >
                          <l.Flag className={styles.langFlag} />
                          {l.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.accountWrapper}>
                <LocaleLink href="/compte" className={styles.accountButton} aria-haspopup="menu">
                  <span className={styles.accountAvatar}>
                    <img src="/icon/header/user.svg" alt="" className={styles.accountAvatarIcon} />
                  </span>
                  <span>{displayName}</span>
                  <img
                    src="/icon/product-detail/chevron-down.svg"
                    alt=""
                    className={`${styles.dropdownChevron} ${styles.chevronLight}`}
                  />
                </LocaleLink>

                <ul className={styles.accountDropdown} role="menu">
                  {user ? (
                    <li>
                      <button type="button" className={styles.accountMenuItem} onClick={handleLogout}>
                        <LogoutIcon className={`${styles.accountMenuIcon} ${styles.accountMenuIconDanger}`} />
                        {dict.header.logout}
                      </button>
                    </li>
                  ) : (
                    <>
                      <li>
                        <LocaleLink href="/connexion" className={styles.accountMenuItem}>
                          <LoginIcon className={styles.accountMenuIcon} />
                          {dict.header.login}
                        </LocaleLink>
                      </li>
                      <li>
                        <LocaleLink href="/inscription" className={styles.accountMenuItem}>
                          <SignupIcon className={styles.accountMenuIcon} />
                          {dict.header.signup}
                        </LocaleLink>
                      </li>
                    </>
                  )}
                  <li>
                    <LocaleLink href="/aide" className={styles.accountMenuItem}>
                      <HelpIcon className={styles.accountMenuIcon} />
                      {dict.header.helpCenter}
                    </LocaleLink>
                  </li>
                </ul>
              </div>

              <LocaleLink href="/cart" className={styles.cartButton} aria-label={dict.header.cart}>
                <span className={styles.cartIconWrapper}>
                  <img src="/icon/header/cart.svg" alt="" className={styles.cartIcon} />
                  {cartCount > 0 && (
                    <span className={styles.cartBadge}>
                      <img src="/icon/header/cart-badge.svg" alt="" className={styles.cartBadgeBg} />
                      <span className={styles.cartBadgeCount}>{cartCount}</span>
                    </span>
                  )}
                </span>
                <span className={styles.cartLabel}>{dict.header.cart}</span>
              </LocaleLink>
            </div>
          </div>

          <nav className={styles.categoriesBar} aria-label={dict.header.categories}>
            {CATEGORIES.map((cat) => (
              <button key={cat.id} type="button" className={styles.categoryButton}>
                <img src={cat.icon} alt="" className={styles.categoryIcon} />
                <span className={styles.categoryLabel}>{cat.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile header — Figma node 372:185 (PWA mobile view) */}
      <div className={styles.mobileHeader}>
        {variant === "detail" ? (
          /* Product detail — Figma node 223:189: back + title + search icon only, no promo strip/search bar */
          <div className={`${styles.mobileDetailSticky} ${scrolled ? styles.mobileDetailStickyScrolled : ""}`}>
            <div className={styles.mobileDetailRow}>
              <button
                type="button"
                className={styles.mobileBackButton}
                aria-label={dict.header.back}
                onClick={() => router.back()}
              >
                <img src="/icon/product-detail/back.svg" alt="" className={styles.mobileBackIcon} />
              </button>

              <p className={styles.mobileTitle}>{dict.header.catalogueTitle}</p>

              <button
                type="button"
                className={styles.mobileDetailSearchButton}
                aria-label={dict.header.search}
                onClick={() => router.push("/recherche")}
              >
                <img src="/icon/header-mobile/search.svg" alt="" className={styles.mobileSearchIcon} />
              </button>
            </div>
          </div>
        ) : variant === "cart" ? (
          /* Cart — Figma node 538:336: back + title + info icon only, no promo strip/search bar */
          <div className={styles.mobileSticky}>
            <div className={styles.mobileDetailRow}>
              <button
                type="button"
                className={styles.mobileBackButton}
                aria-label={dict.header.back}
                onClick={() => router.back()}
              >
                <img src="/icon/product-detail/back.svg" alt="" className={styles.mobileBackIcon} />
              </button>

              <p className={styles.mobileTitle}>{dict.header.cartTitle}</p>

              <button type="button" className={styles.mobileInfoButton} aria-label={dict.header.info}>
                <img src="/icon/cart/info.svg" alt="" className={styles.mobileInfoIcon} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Figma node 373:488 was an empty placeholder slot — now filled by
                the admin-managed announcement bar. Scrolls away with the page;
                only the sticky wrapper below stays fixed. */}
            <AnnouncementBar
              announcements={announcements}
              dismissed={announcementsDismissed}
              variant="mobile"
              onDismiss={dismissAnnouncements}
            />

            <div className={styles.mobileSticky}>
              <div className={styles.mobileTopRow}>
                <button type="button" className={styles.mobileMenuButton} aria-label={dict.header.menu}>
                  <img src="/icon/header-mobile/menu.svg" alt="" className={styles.mobileMenuIcon} />
                </button>

                <p className={styles.mobileTitle}>{dict.header.catalogueTitle}</p>

                <button
                  type="button"
                  className={styles.mobileSearchButton}
                  aria-label={dict.header.search}
                  onClick={() => mobileSearchRef.current?.focus()}
                >
                  <img src="/icon/header-mobile/search.svg" alt="" className={styles.mobileSearchIcon} />
                </button>
              </div>

              <form className={styles.mobileSearchForm} role="search" onSubmit={handleSearchSubmit}>
                <img src="/icon/header-mobile/search.svg" alt="" className={styles.mobileSearchFormIcon} />
                <input
                  ref={mobileSearchRef}
                  type="search"
                  placeholder={dict.header.searchPlaceholderMobile}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.mobileSearchInput}
                />
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function FranceFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20">
      <clipPath id="flag-circle-fr">
        <circle cx="10" cy="10" r="10" />
      </clipPath>
      <g clipPath="url(#flag-circle-fr)">
        <rect width="20" height="20" fill="#ED2939" />
        <rect width="13.3" height="20" fill="#FFFFFF" />
        <rect width="6.7" height="20" fill="#002395" />
      </g>
    </svg>
  );
}

function UkFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20">
      <clipPath id="flag-circle-uk">
        <circle cx="10" cy="10" r="10" />
      </clipPath>
      <g clipPath="url(#flag-circle-uk)">
        <rect width="20" height="20" fill="#00247D" />
        <path d="M0 0L20 20M20 0L0 20" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M0 0L20 20M20 0L0 20" stroke="#CF142B" strokeWidth="1.5" />
        <path d="M10 0V20M0 10H20" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M10 0V20M0 10H20" stroke="#CF142B" strokeWidth="3.5" />
      </g>
    </svg>
  );
}

function LoginIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <path
        d="M8 2H4.5A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18H8M13 14l4-4-4-4M17 10H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" style={{ transform: "scaleX(-1)" }}>
      <path
        d="M8 2H4.5A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18H8M13 14l4-4-4-4M17 10H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SignupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <path
        d="M8 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 18c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5M16 7v6M13 10h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.8 7.8a2.2 2.2 0 1 1 3.3 1.9c-.7.4-1.1.8-1.1 1.6v.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="14.2" r="0.9" fill="currentColor" />
    </svg>
  );
}
