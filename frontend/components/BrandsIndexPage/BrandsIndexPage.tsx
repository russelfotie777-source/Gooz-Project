import Image from "next/image";
import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import Footer from "@/components/Footer/Footer";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import LocaleLink from "@/lib/i18n/LocaleLink";
import type { Brand } from "@/lib/types";
import pageStyles from "@/components/CollectionPage/CollectionPage.module.css";
import styles from "./BrandsIndexPage.module.css";

interface BrandsIndexPageProps {
  brands: Brand[];
  lang: Locale;
}

// Every brand as a logo tile, A→Z, each linking to its own page
// (/marques/<slug>, which already lists that brand's products).
export default function BrandsIndexPage({ brands, lang }: BrandsIndexPageProps) {
  const dict = getDictionary(lang);
  const sorted = [...brands].sort((a, b) => a.name.localeCompare(b.name, lang));

  return (
    <div className={pageStyles.page}>
      <Header />

      <main className={pageStyles.main}>
        <nav className={pageStyles.breadcrumb} aria-label="Breadcrumb">
          <LocaleLink href="/">{dict.collections.breadcrumbHome}</LocaleLink>
          <span aria-hidden="true">/</span>
          <LocaleLink href="/marques" aria-current="page">
            {dict.brandsIndex.title}
          </LocaleLink>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>{dict.brandsIndex.title}</h1>
          <p className={styles.description}>{dict.brandsIndex.description}</p>
        </header>

        {sorted.length > 0 ? (
          <ul className={styles.grid}>
            {sorted.map((brand) => (
              <li key={brand.id}>
                <LocaleLink href={`/marques/${brand.slug}`} className={styles.tile}>
                  <span className={styles.logo}>
                    {brand.logo ? (
                      <Image src={brand.logo} alt="" fill sizes="160px" className={styles.logoImage} />
                    ) : (
                      <span className={styles.initial}>{brand.name.charAt(0).toUpperCase()}</span>
                    )}
                  </span>
                  <span className={styles.name}>{brand.name}</span>
                </LocaleLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.description}>{dict.brandsIndex.empty}</p>
        )}
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}
