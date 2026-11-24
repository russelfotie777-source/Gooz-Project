import type { Product } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./ViewMoreCard.module.css";

export interface ViewMoreCopy {
  title: string;
  subtitle: string;
  /** Total behind the link, when known (e.g. a category's product count). */
  count?: number;
}

export type ViewMoreTone = "blue" | "sunset" | "night";

interface ViewMoreCardProps {
  href: string;
  copy: ViewMoreCopy;
  /** The row's products — the first few become the thumbnail stack. */
  products: Product[];
  tone?: ViewMoreTone;
}

function thumbnailOf(product: Product): string | null {
  const img = product.images.find((i) => i.is_primary) ?? product.images[0];
  return img ? (img.thumbnail_url ?? img.image_url) : null;
}

// Last item of a homepage row: a full-height card inviting the shopper to
// the row's "Voir tout" page, with copy written for that row (see
// home.viewMore in the dictionaries) instead of a bare link.
export default function ViewMoreCard({ href, copy, products, tone = "blue" }: ViewMoreCardProps) {
  const dict = useDictionary();
  const thumbs = products
    .map(thumbnailOf)
    .filter((src): src is string => Boolean(src))
    .slice(0, 3);

  return (
    <LocaleLink href={href} className={`${styles.card} ${styles[tone]}`}>
      <span className={styles.glow} aria-hidden="true" />
      <span className={styles.dots} aria-hidden="true" />

      {thumbs.length > 0 && (
        <span className={styles.stack} aria-hidden="true">
          {thumbs.map((src, i) => (
            // Plain <img>: tiny decorative thumbnails already sized by the API.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src + i} src={src} alt="" className={styles.thumb} loading="lazy" />
          ))}
          <span className={`${styles.thumb} ${styles.more}`}>
            {copy.count ? `+${copy.count > 999 ? "999" : copy.count}` : "+"}
          </span>
        </span>
      )}

      <span className={styles.body}>
        <span className={styles.kicker}>{dict.home.viewMore.kicker}</span>
        <span className={styles.title}>{copy.title}</span>
        <span className={styles.subtitle}>{copy.subtitle}</span>
      </span>

      <span className={styles.cta}>
        {dict.home.viewMore.cta}
        <span className={styles.arrow} aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </LocaleLink>
  );
}
