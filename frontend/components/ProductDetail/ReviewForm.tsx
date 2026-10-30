"use client";

import { useEffect, useState } from "react";
import { ApiValidationError, submitReview } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import type { Review } from "@/lib/types";
import styles from "./ProductDetail.module.css";

const STAR_RATINGS = [1, 2, 3, 4, 5] as const;

interface ReviewFormProps {
  productId: number;
  /** Already-approved reviews only (see ReviewController::index). */
  reviews: Review[];
}

export default function ReviewForm({ productId, reviews }: ReviewFormProps) {
  const dict = useDictionary();
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  // Starts false (matches server render — getSession() reads localStorage,
  // which doesn't exist during SSR) and is corrected right after mount, same
  // fix as CheckoutContext's orderNumber: seeding this from getSession()
  // directly in useState would make the very first client render disagree
  // with the server-rendered HTML.
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => setLoggedIn(Boolean(getSession())), []);

  // Reviews work without an account on purpose — requiring a login here
  // would just turn a visitor away instead of getting their feedback. The
  // submit button was previously wired to nothing at all — this is what
  // actually posts to ReviewController::store.
  async function handleSubmitReview() {
    if (!rating) {
      setReviewStatus("error");
      setReviewMessage(dict.product.ratingRequired);
      return;
    }

    const session = getSession();
    if (!session && !guestName.trim()) {
      setReviewStatus("error");
      setReviewMessage(dict.product.guestNameRequired);
      return;
    }

    setReviewStatus("submitting");
    setReviewMessage(null);
    try {
      await submitReview(
        productId,
        { rating, comment: comment.trim() || undefined, guestName: session ? undefined : guestName.trim() },
        session?.token ?? null
      );
      setReviewStatus("submitted");
      setReviewMessage(dict.product.reviewSubmitted);
      setRating(null);
      setComment("");
      setGuestName("");
    } catch (err) {
      setReviewStatus("error");
      setReviewMessage(
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.product.genericError
      );
    }
  }

  return (
    <div className={styles.reviews}>
      <h2 className={styles.reviewsTitle}>{dict.product.satisfactionTitle}</h2>
      <div className={styles.starPicker} onMouseLeave={() => setHoverRating(null)} role="radiogroup" aria-label={dict.product.satisfactionTitle}>
        {STAR_RATINGS.map((value) => (
          <button
            key={value}
            type="button"
            className={styles.starButton}
            onClick={() => {
              setRating(value);
              if (reviewStatus === "error") {
                setReviewStatus("idle");
                setReviewMessage(null);
              }
            }}
            onMouseEnter={() => setHoverRating(value)}
            role="radio"
            aria-checked={rating === value}
            aria-label={String(value)}
          >
            <img
              src="/icon/product-detail/star.svg"
              alt=""
              className={`${styles.starPickerIcon} ${value <= (hoverRating ?? rating ?? 0) ? styles.starPickerIconFilled : ""}`}
            />
          </button>
        ))}
      </div>

      <h2 className={styles.reviewsTitle}>
        {dict.product.leaveComment} <span className={styles.optional}>{dict.product.optional}</span>
      </h2>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={dict.product.commentPlaceholder}
        className={styles.commentInput}
      />

      {!loggedIn && (
        <>
          <h2 className={styles.reviewsTitle}>{dict.product.yourName}</h2>
          <input
            type="text"
            value={guestName}
            onChange={(e) => {
              setGuestName(e.target.value);
              if (reviewStatus === "error") {
                setReviewStatus("idle");
                setReviewMessage(null);
              }
            }}
            placeholder={dict.product.yourNamePlaceholder}
            className={styles.nameInput}
          />
        </>
      )}

      <div className={styles.reviewActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => {
            setRating(null);
            setComment("");
            setReviewStatus("idle");
            setReviewMessage(null);
          }}
        >
          {dict.product.cancel}
        </button>
        <button
          type="button"
          className={styles.submitButton}
          disabled={reviewStatus === "submitting"}
          onClick={handleSubmitReview}
        >
          {reviewStatus === "submitting" ? dict.product.submittingReview : dict.product.submit}
        </button>
      </div>

      {reviewMessage && (
        <p className={reviewStatus === "error" ? styles.reviewFeedbackError : styles.reviewFeedbackSuccess}>
          {reviewMessage}
        </p>
      )}

      <h2 className={styles.reviewsTitle}>{dict.product.reviewsListTitle(reviews.length)}</h2>
      {reviews.length === 0 ? (
        <p className={styles.noReviews}>{dict.product.noReviews}</p>
      ) : (
        <ul className={styles.reviewList}>
          {reviews.map((review) => (
            <li key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewItemHeader}>
                <span className={styles.reviewAuthor}>
                  {review.user?.name ?? review.guest_name ?? dict.product.anonymousReviewer}
                </span>
                <span className={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
              <span className={styles.reviewMoodLabel} aria-label={`${review.rating}/5`}>
                {STAR_RATINGS.map((value) => (
                  <img
                    key={value}
                    src="/icon/product-detail/star.svg"
                    alt=""
                    className={`${styles.reviewStarIcon} ${value <= review.rating ? styles.starPickerIconFilled : ""}`}
                  />
                ))}
              </span>
              {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
