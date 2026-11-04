import React, { useState } from "react";
import { Tag, Check, X, Loader2 } from "lucide-react";
import { useCheckout } from "../../context/CheckoutContext";
import { scrollToElement } from "../../utils/formErrorNavigation";

interface PromoCodeSectionProps {
  className?: string;
}

export default function PromoCodeSection({ className = "" }: PromoCodeSectionProps) {
  const { couponCode, discount, applyCoupon, removeCoupon } = useCheckout();
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (!clean) {
      setFeedback({ message: "Please enter a promo code.", isError: true });
      const container = document.querySelector<HTMLElement>(".promo-code-section");
      scrollToElement(container, { focusField: true });
      return;
    }

    setLoading(true);
    setFeedback(null);

    const res = await applyCoupon(clean);
    setLoading(false);

    if (res.valid) {
      setInputCode("");
      setFeedback({ message: res.message || "Promo code applied successfully.", isError: false });
    } else {
      setFeedback({ message: res.message || "This promo code is invalid.", isError: true });
      setTimeout(() => {
        const container = document.querySelector<HTMLElement>(".promo-code-section");
        scrollToElement(container, { focusField: true });
      }, 50);
    }
  }

  function handleRemove() {
    removeCoupon();
    setFeedback(null);
    setInputCode("");
  }

  return (
    <div className={`promo-code-section ${className}`}>
      {couponCode ? (
        <div className="promo-applied-box">
          <div className="promo-applied-info">
            <span className="promo-badge">
              <Check size={14} /> Applied: <strong>{couponCode}</strong>
            </span>
            {discount > 0 && (
              <span className="promo-discount-amount">
                Discount: NPR {discount.toLocaleString()}
              </span>
            )}
          </div>
          <button
            type="button"
            className="promo-remove-btn"
            onClick={handleRemove}
            aria-label="Remove promo code"
          >
            <X size={14} /> Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="promo-form" role="form">
          <div className="promo-input-group">
            <Tag size={16} className="promo-tag-icon" />
            <input
              type="text"
              placeholder="Enter promo code"
              value={inputCode}
              onChange={(e) => {
                if (feedback?.isError) setFeedback(null);
                setInputCode(e.target.value.toUpperCase());
              }}
              className={`promo-input ${feedback?.isError ? "input-has-error" : ""}`}
              aria-invalid={Boolean(feedback?.isError)}
              aria-label="Promo code input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className="promo-apply-btn"
            >
              {loading ? <Loader2 size={14} className="spin" /> : "Apply"}
            </button>
          </div>
        </form>
      )}

      {feedback && (
        <p
          className={`promo-feedback-msg ${feedback.isError ? "is-error" : "is-success"}`}
          role="alert"
        >
          {feedback.isError ? "⚠️ " : "✅ "}
          {feedback.message}
        </p>
      )}
    </div>
  );
}
