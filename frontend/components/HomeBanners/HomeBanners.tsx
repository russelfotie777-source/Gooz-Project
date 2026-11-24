import LocaleLink from "@/lib/i18n/LocaleLink";
import { DEAL_BANNERS, STRIP_BANNERS, WIDE_BANNER, type HomeBanner } from "@/lib/homeBanners";
import styles from "./HomeBanners.module.css";

// Static marketing banners between the homepage's product rows — creatives
// and destinations live in lib/homeBanners.ts.

function BannerLink({ banner, className }: { banner: HomeBanner; className?: string }) {
  return (
    <LocaleLink href={banner.href} className={`${styles.banner} ${className ?? ""}`}>
      <picture>
        {banner.mobileSrc && (
          <source
            media="(max-width: 639px)"
            srcSet={banner.mobileSrc}
            width={banner.mobileWidth}
            height={banner.mobileHeight}
          />
        )}
        <img
          src={banner.src}
          alt={banner.alt}
          width={banner.width}
          height={banner.height}
          loading="lazy"
          decoding="async"
          className={styles.image}
        />
      </picture>
    </LocaleLink>
  );
}

/** id="catalogue": the hero CTA and the mystery-box fallback link here. */
export function StripBanners() {
  return (
    <section className={styles.strips} id="catalogue" aria-label="Promotions">
      {STRIP_BANNERS.map((banner) => (
        <BannerLink key={banner.src} banner={banner} className={styles.strip} />
      ))}
    </section>
  );
}

export function WideBanner() {
  return <BannerLink banner={WIDE_BANNER} className={styles.wide} />;
}

export function DealBanners() {
  return (
    <section className={styles.deals} aria-label="Offres">
      {DEAL_BANNERS.map((banner) => (
        <BannerLink key={banner.src} banner={banner} />
      ))}
    </section>
  );
}
