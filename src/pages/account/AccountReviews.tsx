import { useMemo, useState, useEffect, useCallback, type FormEvent } from "react";
import { Star, MessageSquareQuote, CheckCircle, Clock, Trash2, Edit3 } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";

import AccountModal from "../../components/account/AccountModal";
import AccountShell from "../../components/account/AccountShell";
import { useAccount } from "../../context/AccountContext";
import { api, getToken, type MyReviewItem } from "../../api/client";

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="account-stars" style={{ display: "flex", gap: "6px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? "on" : ""}
          onClick={() => onChange(star)}
          aria-label={`${star} stars`}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            color: star <= value ? "#f59e0b" : "#d1d5db",
          }}
        >
          <Star size={24} fill={star <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

function AccountReviews() {
  const { reviews: contextReviews, orders, addReview, updateReview, deleteReview } = useAccount();
  const [params, setParams] = useSearchParams();
  const writeOrderId = params.get("write");
  const writeOrder = orders.find((order) => order.id === writeOrderId);

  const [backendReviews, setBackendReviews] = useState<MyReviewItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingReview, setEditingReview] = useState<{
    id: number | string;
    rating: number;
    title: string;
    body: string;
  } | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [textError, setTextError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [productId, setProductId] = useState(writeOrder?.items[0]?.productId ?? "");

  const writeItem = useMemo(
    () => writeOrder?.items.find((item) => item.productId === productId) ?? writeOrder?.items[0],
    [productId, writeOrder],
  );

  const fetchMyReviews = useCallback(() => {
    if (getToken()) {
      setLoading(true);
      api.getMyReviews()
        .then((data) => {
          setBackendReviews(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setBackendReviews(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setBackendReviews(null);
    }
  }, []);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  function closeWrite() {
    setParams({});
    setTitle("");
    setText("");
    setTextError("");
    setRating(5);
  }

  async function submitNew(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) {
      setTextError("Please enter your review comments");
      return;
    }
    if (!writeOrder || !writeItem) {
      return;
    }

    setSubmitting(true);
    try {
      if (getToken()) {
        await api.submitReview({
          productId: writeItem.productId,
          rating,
          title: title.trim(),
          body: text.trim(),
          orderId: writeOrder.id,
          orderItemId: `${writeOrder.id}-${writeItem.productId}`,
        });
        fetchMyReviews();
      } else {
        addReview({
          productId: writeItem.productId,
          productName: writeItem.name,
          productImage: writeItem.image,
          rating,
          text: text.trim(),
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          orderId: writeOrder.id,
        });
      }
      closeWrite();
    } catch (err: any) {
      setTextError(err?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingReview) return;
    if (!text.trim()) {
      setTextError("Please enter your review comments");
      return;
    }

    setSubmitting(true);
    try {
      if (typeof editingReview.id === "number" && getToken()) {
        await api.updateReview(editingReview.id, {
          rating,
          title: title.trim(),
          body: text.trim(),
        });
        fetchMyReviews();
      } else {
        updateReview(String(editingReview.id), { rating, text: text.trim() });
      }
      setEditingReview(null);
    } catch (err: any) {
      setTextError(err?.message || "Failed to update review");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number | string) {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    if (typeof id === "number" && getToken()) {
      try {
        await api.deleteReview(id);
        fetchMyReviews();
      } catch (err: any) {
        alert(err?.message || "Failed to delete review");
      }
    } else {
      deleteReview(String(id));
    }
  }

  const showBackend = Array.isArray(backendReviews);
  const finalReviews = showBackend ? backendReviews : contextReviews;

  return (
    <AccountShell title="My Reviews">
      {loading ? (
        <div className="account-empty">Loading your reviews...</div>
      ) : finalReviews.length === 0 ? (
        <div className="account-empty" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: "1.05rem", color: "#4b5563", marginBottom: "12px" }}>
            You have not written any product reviews yet.
          </p>
          <p style={{ fontSize: "0.88rem", color: "#6b7280", marginBottom: "20px" }}>
            Reviews can be submitted for products you have purchased once they are delivered.
          </p>
          <Link
            to="/orders"
            className="account-btn"
            style={{ display: "inline-flex", textDecoration: "none" }}
          >
            Check Delivered Orders
          </Link>
        </div>
      ) : (
        <div className="account-review-list">
          {showBackend
            ? backendReviews.map((review) => (
                <article key={review.id} className="account-review-card">
                  <img
                    src={review.productImage || "/src/frontend/assets/images/products/apple.jpg"}
                    alt={review.productName}
                  />
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                      <h3>
                        <Link to={`/product/${review.productId}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {review.productName}
                        </Link>
                      </h3>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: review.status === "approved" ? "#ecfdf5" : review.status === "rejected" ? "#fef2f2" : "#fefce8",
                          color: review.status === "approved" ? "#065f46" : review.status === "rejected" ? "#991b1b" : "#854d0e",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {review.status === "approved" ? <CheckCircle size={11} /> : <Clock size={11} />}
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "4px 0" }}>
                      <p className="account-rating" style={{ margin: 0, color: "#f59e0b", fontSize: "0.95rem" }}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </p>
                      {review.title && (
                        <strong style={{ fontSize: "0.9rem", color: "#1f2937" }}>{review.title}</strong>
                      )}
                    </div>

                    <p style={{ margin: "6px 0", color: "#4b5563", fontSize: "0.88rem" }}>{review.body}</p>

                    <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "0.78rem", color: "#9ca3af" }}>
                      <span>{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {review.helpfulCount > 0 && (
                        <span>👍 {review.helpfulCount} helpful</span>
                      )}
                    </div>

                    {review.reply && (
                      <div
                        style={{
                          background: "#f0fdf4",
                          borderLeft: "3px solid #10b981",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          marginTop: "10px",
                          fontSize: "0.82rem",
                        }}
                      >
                        <strong style={{ color: "#065f46", display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" }}>
                          <MessageSquareQuote size={13} /> Seller Response:
                        </strong>
                        <p style={{ margin: 0, color: "#166534" }}>{review.reply}</p>
                      </div>
                    )}
                  </div>

                  <div className="account-form-actions" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button
                      type="button"
                      className="account-btn ghost"
                      onClick={() => {
                        setEditingReview({
                          id: review.id,
                          rating: review.rating,
                          title: review.title || "",
                          body: review.body,
                        });
                        setRating(review.rating);
                        setTitle(review.title || "");
                        setText(review.body);
                        setTextError("");
                      }}
                    >
                      <Edit3 size={13} style={{ marginRight: "4px" }} /> Edit
                    </button>
                    <button
                      type="button"
                      className="account-btn ghost danger"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 size={13} style={{ marginRight: "4px" }} /> Delete
                    </button>
                  </div>
                </article>
              ))
            : (finalReviews as any[]).map((review) => (
                <article key={review.id} className="account-review-card">
                  <img src={review.productImage} alt={review.productName} />
                  <div>
                    <h3>{review.productName}</h3>
                    <p className="account-rating">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                    <p>{review.text}</p>
                    <small>{review.date}</small>
                  </div>
                  <div className="account-form-actions">
                    <button
                      type="button"
                      className="account-btn ghost"
                      onClick={() => {
                        setEditingReview({
                          id: review.id,
                          rating: review.rating,
                          title: "",
                          body: review.text,
                        });
                        setRating(review.rating);
                        setTitle("");
                        setText(review.text);
                        setTextError("");
                      }}
                    >
                      Edit Review
                    </button>
                    <button
                      type="button"
                      className="account-btn ghost danger"
                      onClick={() => handleDelete(review.id)}
                    >
                      Delete Review
                    </button>
                  </div>
                </article>
              ))}
        </div>
      )}

      {/* Write Modal */}
      <AccountModal open={Boolean(writeOrder)} title="Write Review" onClose={closeWrite}>
        <form className="account-form" onSubmit={submitNew}>
          {writeOrder ? (
            <label>
              Product
              <select
                value={writeItem?.productId}
                onChange={(event) => setProductId(event.target.value)}
              >
                {writeOrder.items.map((item) => (
                  <option key={item.productId} value={item.productId}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <StarPicker value={rating} onChange={setRating} />
          <label>
            Headline (optional)
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Delicious and super fresh!"
            />
          </label>
          <label>
            Review *
            <textarea
              rows={4}
              value={text}
              style={{ borderColor: textError ? "#ef4444" : undefined }}
              onChange={(event) => {
                setText(event.target.value);
                if (textError) setTextError("");
              }}
              placeholder="Share your experience with this fresh harvest..."
            />
            {textError && (
              <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                {textError}
              </span>
            )}
          </label>
          <button type="submit" className="account-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </AccountModal>

      {/* Edit Modal */}
      <AccountModal
        open={Boolean(editingReview)}
        title="Edit Review"
        onClose={() => setEditingReview(null)}
      >
        <form className="account-form" onSubmit={submitEdit}>
          <StarPicker value={rating} onChange={setRating} />
          <label>
            Headline
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Delicious and super fresh!"
            />
          </label>
          <label>
            Review *
            <textarea
              rows={4}
              value={text}
              style={{ borderColor: textError ? "#ef4444" : undefined }}
              onChange={(event) => {
                setText(event.target.value);
                if (textError) setTextError("");
              }}
            />
            {textError && (
              <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                {textError}
              </span>
            )}
          </label>
          <button type="submit" className="account-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </AccountModal>
    </AccountShell>
  );
}

export default AccountReviews;
