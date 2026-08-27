"use client";

import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import ProductCard from "@/components/ProductCard/ProductCard";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useFavorites } from "./useFavorites";
import styles from "./FavoritesDesktop.module.css";

// Desktop favorites list — same data as FavoritesPage (mobile), laid out
// with Header/Footer chrome, consistent with the other desktop account
// pages (see OrderHistoryDesktop, ProfileDesktop).
export default function FavoritesDesktop() {
  const dict = useDictionary();
  const { status, favorites } = useFavorites();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>{dict.favorites.title}</h1>
          <p className={styles.subtitle}>{dict.favorites.subtitle}</p>
        </div>

        {status === "loading" && <p className={styles.message}>{dict.favorites.loading}</p>}
        {status === "error" && <p className={styles.message}>{dict.favorites.genericError}</p>}

        {status === "loggedOut" && (
          <div className={styles.guestPanel}>
            <p>{dict.favorites.loginPrompt}</p>
            <LocaleLink href="/connexion" className={styles.loginLink}>
              {dict.favorites.login}
            </LocaleLink>
          </div>
        )}

        {status === "ready" && favorites.length === 0 && (
          <div className={styles.guestPanel}>
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

      <Footer />
    </div>
  );
}
