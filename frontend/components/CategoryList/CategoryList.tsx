import type { Category } from "@/lib/types";
import styles from "./CategoryList.module.css";

interface CategoryListProps {
  categories: Category[];
}

// Real category photos exported from the Figma mobile design (node 372:185) —
// the mobile header uses photos inside the bubbles, not icons.
const IMAGES: Record<string, string> = {
  telephone: "/icon/header-mobile/telephone.png",
  reseau: "/icon/header-mobile/reseau.png",
  informatique: "/icon/header-mobile/informatique.png",
  securite: "/icon/header-mobile/securite.png",
  electromenager: "/icon/header-mobile/electromenager.png",
};

export default function CategoryList({ categories }: CategoryListProps) {
  return (
    <nav className={styles.wrapper} aria-label="Catégories">
      <ul className={styles.list}>
        {categories.map((category) => (
          <li key={category.id} className={styles.item}>
            <button type="button" className={styles.button}>
              <span className={styles.iconCircle}>
                {IMAGES[category.slug] && (
                  <img src={IMAGES[category.slug]} alt="" className={styles.iconImage} />
                )}
              </span>
              <span className={styles.label}>{category.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
