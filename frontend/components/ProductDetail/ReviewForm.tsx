"use client";

import { useEffect, useState } from "react";
import { ApiValidationError, submitReview } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import type { Review } from "@/lib/types";
import styles from "./ProductDetail.module.css";

// rating maps each mood onto the backend's 1-5 scale (StoreReviewRequest).
const MOOD_DEFS = [
  { id: "very-dissatisfied", icon: "/icon/product-detail/mood-very-dissatisfied.svg", key: "veryDissatisfied", rating: 1 },
  { id: "worried", icon: "/icon/product-detail/mood-worried.svg", key: "worried", rating: 2 },
  { id: "content", icon: "/icon/product-detail/mood-content.svg", key: "content", rating: 3 },
  { id: "calm", icon: "/icon/product-detail/mood-calm.svg", key: "calm", rating: 4 },
  { id: "happy", icon: "/icon/product-detail/mood-happy.svg", key: "happy", rating: 5 },
] as const;

interface ReviewFormProps {
  productId: number;
  /** Already-approved reviews only (see ReviewController::index). */
  reviews: Review[];
}

export default function ReviewForm({ productId, reviews }: ReviewFormProps) {
  const dict = useDictionary();
  const MOODS = MOOD_DEFS.map((m) => ({ ...m, label: dict.product.moods[m.key] }));
  const [mood, setMood] = useState<(typeof MOODS)[number]["id"] | null>(null);
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
    if (!mood) {
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

    const rating = MOODS.find((m) => m.id === mood)?.rating ?? 3;

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
      setMood(null);
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
      <div className={styles.moods}>
        {MOODS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`${styles.moodButton} ${mood === m.id ? styles.moodButtonActive : ""}`}
            onClick={() => {
              setMood(m.id);
              if (reviewStatus === "error") {
                setReviewStatus("idle");
                setReviewMessage(null);
              }
            }}
            aria-pressed={mood === m.id}
          >
            <img src={m.icon} alt="" className={styles.moodIcon} />
            <span className={styles.moodLabel}>{m.label}</span>
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
            setMood(null);
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
              <span className={styles.reviewMoodLabel}>
                {MOODS.find((m) => m.rating === review.rating)?.label ?? `${review.rating}/5`}
              </span>
              {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
