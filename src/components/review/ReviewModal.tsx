import React, { useState, useEffect } from "react";
import { Star, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../api/client";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string;
  orderId?: string;
  orderItemId?: string;
  existingReview?: {
    id: number;
    rating: number;
    title: string;
    body: string;
  } | null;
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  orderId,
  orderItemId,
  existingReview,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [body, setBody] = useState(existingReview?.body || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.title || "");
      setBody(existingReview.body || "");
    } else {
      setRating(5);
      setTitle("");
      setBody("");
    }
    setError(null);
    setSuccess(false);
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 5) {
      setError("Please write at least 5 characters in your review.");
      const textarea = document.getElementById("review-body") as HTMLTextAreaElement | null;
      textarea?.focus();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (existingReview) {
        await api.updateReview(existingReview.id, {
          rating,
          title: title.trim(),
          body: body.trim(),
        });
      } else {
        await api.submitReview({
          productId,
          rating,
          title: title.trim(),
          body: body.trim(),
          orderId,
          orderItemId,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="review-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="review-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <div>
            <h3>{existingReview ? "Edit Your Review" : "Write a Product Review"}</h3>
            <p className="review-modal-subtitle">{productName}</p>
          </div>
          <button type="button" className="review-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {productImage && (
          <div className="review-modal-product-summary">
            <img src={productImage} alt={productName} className="review-modal-product-img" />
            <div>
              <strong>{productName}</strong>
              {orderId && <small>Order #{orderId}</small>}
            </div>
          </div>
        )}

        {success ? (
          <div className="review-modal-success">
            <CheckCircle2 size={36} color="#16a34a" />
            <p>Thank you! Your verified review has been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="review-modal-form">
            {error && (
              <div className="review-modal-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="review-modal-field">
              <label>Your Overall Rating <i>*</i></label>
              <div className="review-modal-star-picker">
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeRating = hoverRating !== null ? hoverRating : rating;
                  const isFilled = star <= activeRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="review-star-btn"
                      aria-label={`${star} star`}
                    >
                      <Star
                        size={28}
                        fill={isFilled ? "#f59e0b" : "none"}
                        stroke={isFilled ? "#f59e0b" : "#cbd5e1"}
                      />
                    </button>
                  );
                })}
                <span className="review-star-label">
                  {rating === 5 ? "5/5 - Outstanding" : `${rating}/5 Stars`}
                </span>
              </div>
            </div>

            <div className="review-modal-field">
              <label htmlFor="review-title">Review Headline (optional)</label>
              <input
                id="review-title"
                type="text"
                placeholder="e.g. Crisp, sweet and very fresh!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
              />
            </div>

            <div className="review-modal-field">
              <label htmlFor="review-body">
                Detailed Feedback <i>*</i>
              </label>
              <textarea
                id="review-body"
                rows={4}
                placeholder="How was the quality, taste, freshness, and packaging? Would you recommend it?"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              <small className="review-char-count">{body.length} / 3000 characters</small>
            </div>

            <div className="review-modal-actions">
              <button type="button" className="review-modal-cancel" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="review-modal-submit" disabled={submitting || body.trim().length < 5}>
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin" /> Saving...
                  </>
                ) : existingReview ? (
                  "Update Review"
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
