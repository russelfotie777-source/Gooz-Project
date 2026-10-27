"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import type { ProductImage } from "@/lib/types";
import styles from "./ProductDetail.module.css";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  /** Changes whenever the shopper picks a different variant — resets the
   *  gallery back to the first photo instead of leaving it on whatever
   *  slide it was on for the previous variant's own (different) image set. */
  resetKey: number | null;
}

export default function ProductGallery({ images, productName, resetKey }: ProductGalleryProps) {
  const dict = useDictionary();
  const [activeImage, setActiveImage] = useState(0);
  // next/image needs a stable src per <Image> — imperatively mutating the
  // DOM node's src (the old <img onError> pattern) fights React's own
  // re-renders here, so failures are tracked in state instead, keyed by
  // each image's own (real, backend) id.
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(new Set());
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
    setActiveImage(0);
    setFailedImageIds(new Set());
  }, [resetKey]);

  function handleTrackScroll() {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveImage(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goToImage(index: number) {
    const el = trackRef.current;
    if (el) {
      el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    }
    setActiveImage(index);
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageWrapper}>
        <div className={styles.swipeTrack} ref={trackRef} onScroll={handleTrackScroll}>
          {images.map((image) => (
            <div className={styles.swipeSlide} key={image.id}>
              <Image
                src={failedImageIds.has(image.id) ? PLACEHOLDER_IMAGE : (image.image_url ?? PLACEHOLDER_IMAGE)}
                alt={image.alt_text || productName}
                className={styles.mainImage}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority={image.id === 0}
                onError={() => setFailedImageIds((prev) => new Set(prev).add(image.id))}
              />
            </div>
          ))}
        </div>

        <div className={styles.dots}>
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={`${styles.dot} ${index === activeImage ? styles.dotActive : ""}`}
              onClick={() => goToImage(index)}
              aria-label={dict.product.viewImage(index + 1)}
            />
          ))}
        </div>
      </div>

      <div className={styles.thumbnails}>
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className={`${styles.thumbnail} ${index === activeImage ? styles.thumbnailActive : ""}`}
            onClick={() => goToImage(index)}
            aria-label={dict.product.viewImage(index + 1)}
          >
            <Image
              src={failedImageIds.has(image.id) ? PLACEHOLDER_IMAGE : (image.image_url ?? PLACEHOLDER_IMAGE)}
              alt=""
              className={styles.thumbnailImage}
              fill
              sizes="90px"
              onError={() => setFailedImageIds((prev) => new Set(prev).add(image.id))}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
