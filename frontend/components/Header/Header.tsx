"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import type { Category } from "@/lib/types";
import AnnouncementBar from "@/components/AnnouncementBar/AnnouncementBar";
import SearchSuggestions from "@/components/SearchSuggestions/SearchSuggestions";
import AccountMenu from "./AccountMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import StarrySky from "./StarrySky";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { useAnnouncements } from "./useAnnouncements";
import { useHeaderSearch } from "./useHeaderSearch";
import { useHeaderSession } from "./useHeaderSession";
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

export default function Header({ cartCount: cartCountProp = 0, variant = "default" }: HeaderProps) {
  const dict = useDictionary();
  const router = useLocaleRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    searchExamples,
    searchExampleIndex,
    searchFocused,
    setSearchFocused,
    mobileSearchRef,
    searchWrapperRef,
    mobileSearchWrapperRef,
    handleSearchSubmit,
  } = useHeaderSearch();
  const { user, cartCount, displayName, handleLogout } = useHeaderSession(cartCountProp);
  const { announcements, announcementsDismissed, dismissAnnouncements } = useAnnouncements();

  // Was a fixed list of invented labels (Promotion/Best Seller/...) that
  // never linked anywhere and didn't match the shop's real categories (no
  // "Informatique" category actually exists) — real, clickable categories
  // now, same source as CategoryList's mobile bar.
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

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
            <LocaleLink href="/" aria-label={dict.header.catalogueTitle}>
              <img
                src="/logo-shopitech-primaire/logoFichier 16version F.png"
                alt="Shopitech"
                className={styles.logo}
              />
            </LocaleLink>

            <div className={styles.searchWrapper} ref={searchWrapperRef}>
              <form className={styles.searchForm} role="search" onSubmit={handleSearchSubmit}>
                {!searchFocused && !searchQuery && (
                  <SearchPrompt
                    phrase={dict.header.searchPlaceholder}
                    example={searchExamples[searchExampleIndex]}
                    className={styles.desktopSearchPrompt}
                  />
                )}
                <input
                  type="search"
                  aria-label={dict.header.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton}>
                  {dict.header.searchButton}
                </button>
              </form>
              {searchFocused && (
                <SearchSuggestions query={searchQuery} onSelect={() => setSearchFocused(false)} />
              )}
            </div>

            <div className={styles.actions}>
              <ThemeToggle className={styles.themeToggleDesktop} />

              <LanguageSwitcher />

              <AccountMenu user={user} displayName={displayName} onLogout={handleLogout} />

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
            {categories.map((category) => (
              <LocaleLink key={category.id} href={`/categories/${category.slug}`} className={styles.categoryButton}>
                {category.image && <img src={category.image} alt="" className={styles.categoryIcon} />}
                <span className={styles.categoryLabel}>{category.name}</span>
              </LocaleLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile header — Figma node 372:185 (PWA mobile view) */}
      <div className={styles.mobileHeader}>
        {variant === "detail" ? (
          /* Product detail — Figma node 223:189: back + title, no promo
             strip/search bar. The search icon this row used to have (next
             to the title, opening /recherche) was removed — it served no
             purpose here (search is already reachable from the main
             header). */
          <div className={styles.mobileDetailSticky}>
            <div className={styles.mobileDetailRow}>
              <button
                type="button"
                className={styles.mobileBackButton}
                aria-label={dict.header.back}
                onClick={() => router.back()}
              >
                <img src="/icon/product-detail/back-circle.svg" alt="" className={styles.mobileBackIcon} />
              </button>

              <p className={styles.mobileTitle}>{dict.header.catalogueTitle}</p>

              {/* Balances .mobileBackButton's width so the centered title
                  text lands at the row's true center instead of drifting
                  right now that there's nothing on this side. */}
              <span className={styles.mobileDetailSpacer} aria-hidden="true" />
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
                <img src="/icon/product-detail/back-circle.svg" alt="" className={styles.mobileBackIcon} />
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
                only the sticky wrapper below stays fixed. Wrapped in its own
                orange zone (AnnouncementBar itself is untouched) so the pill
                sits on the same solid color as the sticky block beneath it. */}
            <div className={styles.mobilePromoZone}>
              <AnnouncementBar
                announcements={announcements}
                dismissed={announcementsDismissed}
                variant="mobile"
                onDismiss={dismissAnnouncements}
              />
            </div>

            <div className={styles.mobileCatalogueSticky}>
              <StarrySky />

              <div className={styles.mobileTopRow}>
                <LocaleLink href="/" aria-label={dict.header.catalogueTitle}>
                  <img
                    src="/logo-shopitech-primaire/logoFichier 16version F.png"
                    alt="Shopitech"
                    className={styles.mobileLogo}
                  />
                </LocaleLink>
                <ThemeToggle className={styles.themeToggleMobile} />
              </div>

              <div className={styles.mobileSearchWrapper} ref={mobileSearchWrapperRef}>
                <form className={styles.mobileSearchForm} role="search" onSubmit={handleSearchSubmit}>
                  <img src="/icon/header-mobile/search.svg" alt="" className={styles.mobileSearchFormIcon} />
                  {!searchFocused && !searchQuery && (
                    <SearchPrompt
                      phrase={dict.header.searchPlaceholder}
                      example={searchExamples[searchExampleIndex]}
                      className={styles.mobileSearchPrompt}
                    />
                  )}
                  <input
                    ref={mobileSearchRef}
                    type="search"
                    aria-label={dict.header.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    className={styles.mobileSearchInput}
                  />
                </form>
                {searchFocused && (
                  <SearchSuggestions query={searchQuery} onSelect={() => setSearchFocused(false)} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function SearchPrompt({
  phrase,
  example,
  className,
}: {
  phrase: string;
  example: string;
  className: string;
}) {
  return (
    <span className={`${styles.searchPrompt} ${className}`} aria-hidden="true">
      <span>{phrase} “</span>
      <span className={styles.searchTermWindow}>
        <span key={example} className={styles.searchTerm}>
          {example}
        </span>
      </span>
      <span>”</span>
    </span>
  );
}
