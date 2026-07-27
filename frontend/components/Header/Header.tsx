"use client";

import { useRef, useState } from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  cartCount?: number;
}

const CATEGORIES = [
  { id: "promotion", label: "PROMOTION !!!", icon: "/icon/header/promotion.svg" },
  { id: "best-seller-1", label: "BEST SELLER", icon: "/icon/header/best-seller-1.svg" },
  { id: "best-seller-2", label: "BEST SELLER", icon: "/icon/header/best-seller-2.svg" },
  { id: "electromenager", label: "ELECTROMENAGER", icon: "/icon/header/electromenager.svg" },
  { id: "securite", label: "SECURITE", icon: "/icon/header/securite.svg" },
  { id: "informatique", label: "INFORMATIQUE", icon: "/icon/header/informatique.svg" },
];

export default function Header({ cartCount = 0 }: HeaderProps) {
  const [query, setQuery] = useState("");
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  return (
    <header className={styles.header}>
      {/* Desktop / tablet header — Figma node 1057:2032 */}
      <div className={styles.desktopHeader}>
        {/* Empty in the Figma design (node 907:1140) — placeholder slot for a future ad banner */}
        <div className={styles.promoStrip} aria-hidden="true" />

        <div className={styles.mainRow}>
          <button type="button" className={styles.menuButton} aria-label="Menu">
            <img src="/icon/header/hamburger.svg" alt="" className={styles.menuIcon} />
          </button>

          <img
            src="/logo-shopitech-primaire/logoFichier 5version F.png"
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
            <button type="button" className={styles.langButton}>
              <span>FR</span>
              <img src="/icon/header/lang-dropdown.svg" alt="" className={styles.langIcon} />
            </button>

            <button type="button" className={styles.iconButton} aria-label="Compte">
              <img src="/icon/header/user.svg" alt="" className={styles.actionIcon} />
            </button>

            <button type="button" className={styles.cartButton} aria-label="Panier">
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
            </button>
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

      {/* Mobile header — Figma node 372:185 (PWA mobile view) */}
      <div className={styles.mobileHeader}>
        {/* Empty in the Figma design (node 373:488) — placeholder slot for a future ad banner */}
        <div className={styles.mobilePromoStrip} aria-hidden="true" />

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
    </header>
  );
}
