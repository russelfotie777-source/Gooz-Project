import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import CategoryResults from "@/components/CategoryResults/CategoryResults";
import DealCountdown from "@/components/DealCountdown/DealCountdown";
import Footer from "@/components/Footer/Footer";
import PersonalCollection from "@/components/CollectionPage/PersonalCollection";
import { getProductsPage } from "@/lib/api";
import { collectionPath, type CollectionDefinition } from "@/lib/collections";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./CollectionPage.module.css";

export const COLLECTION_PAGE_SIZE = 24;

interface CollectionPageProps {
  collection: CollectionDefinition;
  lang: Locale;
  page: number;
}

// A "Voir tout" page: one homepage row's full, paginated list, with the
// usual sort + price filters on top (CategoryResults in "collection" mode).
export default async function CollectionPage({ collection, lang, page }: CollectionPageProps) {
  const dict = getDictionary(lang);
  const copy = dict.collections[collection.key];

  // "Pour vous" starts from the new-arrivals list (its no-history
  // fallback) and personalizes client-side.
  const baseParams = collection.personal ? { sort_by: "created_at" as const, sort_dir: "desc" as const } : collection.params;
  const firstPage = await getProductsPage({
    ...baseParams,
    per_page: COLLECTION_PAGE_SIZE,
    page: collection.personal ? 1 : page,
  }).catch(() => ({ products: [], currentPage: 1, lastPage: 1, total: 0 }));

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <LocaleLink href="/">{dict.collections.breadcrumbHome}</LocaleLink>
          <span aria-hidden="true">/</span>
          <LocaleLink href={collectionPath(collection.key)} aria-current="page">
            {copy.title}
          </LocaleLink>
        </nav>

        {collection.personal ? (
          <PersonalCollection
            title={copy.title}
            description={copy.description}
            fallbackProducts={firstPage.products}
            fallbackLastPage={firstPage.lastPage}
            fallbackTotal={firstPage.total}
            pageSize={COLLECTION_PAGE_SIZE}
          />
        ) : (
          <CategoryResults
            mode="collection"
            resultsTitle={copy.title}
            description={copy.description}
            headerExtra={collection.countdown ? <DealCountdown /> : undefined}
            baseParams={collection.params}
            initialProducts={firstPage.products}
            initialLastPage={firstPage.lastPage}
            initialTotal={firstPage.total}
            initialPage={page}
            pageSize={COLLECTION_PAGE_SIZE}
            cardLayout="market"
          />
        )}
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}
