"use client";

import BottomNav from "@/components/BottomNav/BottomNav";
import ProductCard from "@/components/ProductCard/ProductCard";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { useFavorites } from "./useFavorites";
import styles from "./FavoritesPage.module.css";

// Mobile favorites list — reached from the "Mes favoris" row in ProfilePage.
// No Figma node (backend-driven feature); layout mirrors OrderHistoryPage's
// topBar convention, with a product grid (like CatalogueSection) instead of
// order cards.
export default function FavoritesPage() {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const { status, favorites } = useFavorites();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backButton} aria-label={dict.header.back} onClick={() => router.back()}>
          <img src="/icon/product-detail/back.svg" alt="" className={styles.backIcon} />
        </button>
        <h1 className={styles.title}>{dict.favorites.title}</h1>
        <span className={styles.spacer} aria-hidden />
      </div>

      <main className={styles.main}>
        {status === "loading" && <p className={styles.message}>{dict.favorites.loading}</p>}

        {status === "error" && <p className={styles.message}>{dict.favorites.genericError}</p>}

        {status === "loggedOut" && (
          <div className={styles.message}>
            <p>{dict.favorites.loginPrompt}</p>
            <LocaleLink href="/connexion" className={styles.loginLink}>
              {dict.favorites.login}
            </LocaleLink>
          </div>
        )}

        {status === "ready" && favorites.length === 0 && (
          <div className={styles.message}>
            <p>{dict.favorites.empty}</p>
            <LocaleLink href="/" className={styles.loginLink}>
              {dict.favorites.emptyCta}
            </LocaleLink>
          </div>
        )}

        {status === "ready" && favorites.length > 0 && (
          <div className={styles.grid}>
            {favorites.map((favorite) => (
              <ProductCard key={favorite.product.id} product={favorite.product} layout="column" />
            ))}
          </div>
        )}
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
