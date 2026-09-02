"use client";

import type { Banner, Category } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import HeroBanner from "@/components/HeroBanner/HeroBanner";
import AdBannerCarousel from "@/components/AdBannerCarousel/AdBannerCarousel";
import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  categories: Category[];
  banners: Banner[];
  /** The two side ad slots — admin-managed (location homepage_ad_1/2), each
   *  its own carousel. Optional: CategoryPage reuses this same component for
   *  its own hero but never fetches these, so both slots simply render
   *  nothing there. */
  adSlotOne?: Banner[];
  adSlotTwo?: Banner[];
}

// Desktop-only row from the Figma design (node 861:3811): a category shortcut
// card + the hero carousel + two stacked ad-banner slots. The mobile layout
// only shows the hero banner (see HeroSection.module.css) — untouched.
export default function HeroSection({ categories, banners, adSlotOne = [], adSlotTwo = [] }: HeroSectionProps) {
  const dict = useDictionary();

  return (
    <div className={styles.row}>
      <aside className={styles.categoryCard} aria-label={dict.home.browseByCategory}>
        <ul className={styles.categoryList}>
          {categories.map((category) => (
            <li key={category.id}>
              <LocaleLink href={`/categories/${category.slug}`} className={styles.categoryLink}>
                {category.name}
              </LocaleLink>
            </li>
          ))}
        </ul>
      </aside>

      <div className={styles.heroWrapper}>
        <HeroBanner banners={banners} />
      </div>

      <aside className={styles.adColumn} aria-hidden="true">
        <div className={styles.adBanner}>
          <AdBannerCarousel banners={adSlotOne} />
        </div>
        <div className={styles.adBanner}>
          <AdBannerCarousel banners={adSlotTwo} />
        </div>
      </aside>
    </div>
  );
}
