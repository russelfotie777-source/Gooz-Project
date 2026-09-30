"use client";

import type { ReactNode } from "react";
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
  /** Replaces a slot's admin-managed carousel outright when given — used by
   *  HomePage for the flash-countdown/featured-product cards. CategoryPage
   *  never passes these, so its own ad slots behave exactly as before. */
  adSlotOneContent?: ReactNode;
  adSlotTwoContent?: ReactNode;
}

// Desktop-only row from the Figma design (node 861:3811): a category shortcut
// card + the hero carousel + two stacked ad-banner slots. The mobile layout
// only shows the hero banner (see HeroSection.module.css) — untouched.
export default function HeroSection({
  categories,
  banners,
  adSlotOne = [],
  adSlotTwo = [],
  adSlotOneContent,
  adSlotTwoContent,
}: HeroSectionProps) {
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

      {/* No aria-hidden here (unlike before): AdBannerCarousel's plain <img>
          slides truly had nothing for assistive tech, but adSlotOneContent/
          adSlotTwoContent now carry real links (see AdCountdownCard/
          Product3DCard) — hiding an ancestor of focusable content is a
          bug (reachable via Tab, invisible to a screen reader). An empty
          <aside> (nothing rendered in either slot) is harmless either way. */}
      <aside className={styles.adColumn}>
        <div className={styles.adBanner}>{adSlotOneContent ?? <AdBannerCarousel banners={adSlotOne} />}</div>
        <div className={styles.adBanner}>{adSlotTwoContent ?? <AdBannerCarousel banners={adSlotTwo} />}</div>
      </aside>
    </div>
  );
}
