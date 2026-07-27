import type { Category } from "@/lib/types";
import HeroBanner from "@/components/HeroBanner/HeroBanner";
import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  categories: Category[];
}

// Desktop-only row from the Figma design (node 861:3811): a category shortcut
// card + the hero carousel + two stacked ad-banner slots. The mobile layout
// only shows the hero banner (see HeroSection.module.css) — untouched.
export default function HeroSection({ categories }: HeroSectionProps) {
  return (
    <div className={styles.row}>
      <aside className={styles.categoryCard} aria-label="Parcourir par catégorie">
        <ul className={styles.categoryList}>
          {categories.map((category) => (
            <li key={category.id}>
              <button type="button" className={styles.categoryLink}>
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className={styles.heroWrapper}>
        <HeroBanner />
      </div>

      <aside className={styles.adColumn} aria-hidden="true">
        <div className={styles.adBanner} />
        <div className={styles.adBanner} />
      </aside>
    </div>
  );
}
