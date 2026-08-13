"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCart, logout as apiLogout } from "@/lib/api";
import { clearSession, getSession } from "@/lib/auth";
import { notifyCartUpdated, onCartUpdated } from "@/lib/cartEvents";
import { splitName } from "@/lib/name";
import type { User } from "@/lib/types";
import styles from "./Header.module.css";

interface HeaderProps {
  cartCount?: number;
  /**
   * "detail" swaps the mobile row for back + title + search only (Figma node 223:189).
   * "cart" swaps it for back + title + info icon, no search bar (Figma node 538:336).
   * Desktop is unaffected by either.
   */
  variant?: "default" | "detail" | "cart";
}

const CATEGORIES = [
  { id: "promotion", label: "PROMOTION !!!", icon: "/icon/header/promotion.svg" },
  { id: "best-seller-1", label: "BEST SELLER", icon: "/icon/header/best-seller-1.svg" },
  { id: "best-seller-2", label: "BEST SELLER", icon: "/icon/header/best-seller-2.svg" },
  { id: "electromenager", label: "ELECTROMENAGER", icon: "/icon/header/electromenager.svg" },
  { id: "securite", label: "SECURITE", icon: "/icon/header/securite.svg" },
  { id: "informatique", label: "INFORMATIQUE", icon: "/icon/header/informatique.svg" },
];

const LANGUAGES = [
  { code: "FR", label: "FR", Flag: FranceFlag },
  { code: "EN", label: "ENG", Flag: UkFlag },
] as const;

export default function Header({ cartCount: cartCountProp = 0, variant = "default" }: HeaderProps) {
  const [query, setQuery] = useState("");
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]["code"]>("FR");
  const [langOpen, setLangOpen] = useState(false);
  const langWrapperRef = useRef<HTMLDivElement>(null);
  const activeLanguage = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  // Pages render this with a prop seeded from mock/server data (see e.g.
  // CartPage's comments). Once a real session exists, the actual cart count
  // is fetched here and kept in sync via the cartEvents pub/sub — cart
  // mutations happen in components (ProductDetail, CartItems) that have no
  // other relationship to Header, so a global event is simpler than
  // threading a cart store through every page that renders Header.
  const [cartCount, setCartCount] = useState(cartCountProp);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    setUser(session.user);

    getCart(session.token)
      .then((cart) => setCartCount(cart.items.length))
      .catch(() => {});

    return onCartUpdated(setCartCount);
  }, []);

  function handleLogout() {
    const session = getSession();
    if (session) apiLogout(session.token);
    clearSession();
    setUser(null);
    setCartCount(0);
    notifyCartUpdated(0);
  }

  const userNameParts = user ? splitName(user.name) : null;
  const displayName = userNameParts ? userNameParts.prenom || userNameParts.nom || "Mon compte" : "Mon compte";

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
        {/* Empty in the Figma design (node 907:1140) — placeholder slot for a future ad banner.
            Scrolls away with the page; only the sticky wrapper below stays fixed. */}
        <div className={styles.promoStrip} aria-hidden="true" />

        <div className={styles.desktopSticky}>
          <div className={styles.mainRow}>
            <button type="button" className={styles.menuButton} aria-label="Menu">
              <img src="/icon/header/hamburger.svg" alt="" className={styles.menuIcon} />
            </button>

            <img
              src="/logo-shopitech-primaire/logoFichier 16version F.png"
              alt="Shopitech"
              className={styles.logo}
            />

            <form className={styles.searchForm} role="search">
              <input
                type="search"
                placeholder="Rechercher un produit"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Rechercher
              </button>
            </form>

            <div className={styles.actions}>
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
                          onClick={() => {
                            setLanguage(l.code);
                            setLangOpen(false);
                          }}
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
                <button type="button" className={styles.accountButton} aria-haspopup="menu">
                  <span className={styles.accountAvatar}>
                    <img src="/icon/header/user.svg" alt="" className={styles.accountAvatarIcon} />
                  </span>
                  <span>{displayName}</span>
                  <img
                    src="/icon/product-detail/chevron-down.svg"
                    alt=""
                    className={`${styles.dropdownChevron} ${styles.chevronLight}`}
                  />
                </button>

                <ul className={styles.accountDropdown} role="menu">
                  {user ? (
                    <li>
                      <button type="button" className={styles.accountMenuItem} onClick={handleLogout}>
                        <LogoutIcon className={`${styles.accountMenuIcon} ${styles.accountMenuIconDanger}`} />
                        Déconnexion
                      </button>
                    </li>
                  ) : (
                    <>
                      <li>
                        <Link href="/connexion" className={styles.accountMenuItem}>
                          <LoginIcon className={styles.accountMenuIcon} />
                          Connexion
                        </Link>
                      </li>
                      <li>
                        <Link href="/inscription" className={styles.accountMenuItem}>
                          <SignupIcon className={styles.accountMenuIcon} />
                          Inscription
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <button type="button" className={styles.accountMenuItem}>
                      <HelpIcon className={styles.accountMenuIcon} />
                      Centre d&apos;aide
                    </button>
                  </li>
                </ul>
              </div>

              <Link href="/cart" className={styles.cartButton} aria-label="Panier">
                <span className={styles.cartIconWrapper}>
                  <img src="/icon/header/cart.svg" alt="" className={styles.cartIcon} />
                  {cartCount > 0 && (
                    <span className={styles.cartBadge}>
                      <img src="/icon/header/cart-badge.svg" alt="" className={styles.cartBadgeBg} />
                      <span className={styles.cartBadgeCount}>{cartCount}</span>
                    </span>
                  )}
                </span>
                <span className={styles.cartLabel}>Panier</span>
              </Link>
            </div>
          </div>

          <nav className={styles.categoriesBar} aria-label="Catégories rapides">
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
                aria-label="Retour"
                onClick={() => router.back()}
              >
                <img src="/icon/product-detail/back.svg" alt="" className={styles.mobileBackIcon} />
              </button>

              <p className={styles.mobileTitle}>Shopitech Catalogue.</p>

              <button type="button" className={styles.mobileDetailSearchButton} aria-label="Rechercher">
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
                aria-label="Retour"
                onClick={() => router.back()}
              >
                <img src="/icon/product-detail/back.svg" alt="" className={styles.mobileBackIcon} />
              </button>

              <p className={styles.mobileTitle}>Mon Panier.</p>

              <button type="button" className={styles.mobileInfoButton} aria-label="Informations">
                <img src="/icon/cart/info.svg" alt="" className={styles.mobileInfoIcon} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Empty in the Figma design (node 373:488) — placeholder slot for a future ad banner.
                Scrolls away with the page; only the sticky wrapper below stays fixed. */}
            <div className={styles.mobilePromoStrip} aria-hidden="true" />

            <div className={styles.mobileSticky}>
              <div className={styles.mobileTopRow}>
                <button type="button" className={styles.mobileMenuButton} aria-label="Menu">
                  <img src="/icon/header-mobile/menu.svg" alt="" className={styles.mobileMenuIcon} />
                </button>

                <p className={styles.mobileTitle}>Shopitech Catalogue.</p>

                <button
                  type="button"
                  className={styles.mobileSearchButton}
                  aria-label="Rechercher"
                  onClick={() => mobileSearchRef.current?.focus()}
                >
                  <img src="/icon/header-mobile/search.svg" alt="" className={styles.mobileSearchIcon} />
                </button>
              </div>

              <form className={styles.mobileSearchForm} role="search">
                <img src="/icon/header-mobile/search.svg" alt="" className={styles.mobileSearchFormIcon} />
                <input
                  ref={mobileSearchRef}
                  type="search"
                  placeholder="Rechercher un produit..."
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
