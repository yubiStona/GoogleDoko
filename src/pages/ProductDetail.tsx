import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ChevronRight,
  Heart,
  Home,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Scissors,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  UserRound,
} from "lucide-react";

import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import WhyChooseUs from "../components/WhyChooseUs";
import PopularProducts from "../components/PopularProducts";
import Newsletter from "../components/NewsLetter";
import Footer from "../components/layout/Footer";

import { type Product } from "../data/products";
import { getProductDetails } from "../data/productDetails";
import {
  getProductVarieties,
  type ProductVariety,
} from "../data/productVarieties";
import { useCart } from "../context/CartContext";
import { useCheckout } from "../context/CheckoutContext";
import { useWishlist } from "../context/WishlistContext";
import { useShopAuth } from "../hooks/useShopAuth";
import { useGetProductByIdQuery } from "../store/api/apiSlice";
import { api, type ProductReview } from "../api/client";

type DetailTab = "about" | "nutrition" | "reviews";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { beginBuyNow } = useCheckout();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { allow, isLoggedIn } = useShopAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedVarietyIndex, setSelectedVarietyIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>("about");

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchReviews = useCallback(() => {
    if (!id) return;
    setReviewsLoading(true);
    api
      .getProductReviews(id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab === "reviews") fetchReviews();
  }, [activeTab, fetchReviews]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setReviewError("");
    setReviewSubmitting(true);
    try {
      await api.submitReview({
        productId: id,
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
      });
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
      setReviewSuccess(true);
      fetchReviews();
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: any) {
      setReviewError(err.message || "Could not submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  const { data: serverProduct, isLoading: isProductLoading } = useGetProductByIdQuery(id || "", {
    skip: !id,
  });
  const rawProduct = serverProduct
    ? (serverProduct as unknown as Product)
    : undefined;

  const product: Product | undefined = useMemo(() => {
    if (!rawProduct) return undefined;
    return {
      ...rawProduct,
      origin: rawProduct.origin || "Nepal",
      seller: rawProduct.seller || "Local Farm",
      weight: rawProduct.weight || "1 kg",
      gallery:
        Array.isArray(rawProduct.gallery) && rawProduct.gallery.length > 0
          ? rawProduct.gallery
          : [rawProduct.image || "/src/frontend/assets/images/organic-vegetables.jpg"],
    };
  }, [rawProduct]);

  useEffect(() => {
    setSelectedVarietyIndex(0);
    setQuantity(1);
  }, [id]);

  const varietiesList: ProductVariety[] = useMemo(() => {
    if (!product) return [];
    return getProductVarieties(product);
  }, [product]);

  const currentVariety = varietiesList[selectedVarietyIndex] || varietiesList[0];

  const currentImage =
    currentVariety?.image ||
    product?.image ||
    "/src/frontend/assets/images/organic-vegetables.jpg";

  const displayTitle = currentVariety?.title || product?.name || "";
  const displayPrice = currentVariety?.price || product?.price || 0;
  const displayOrigin = currentVariety?.origin || product?.origin || "Nepal";
  const displaySeller = currentVariety?.seller || product?.seller || "Local Farm";
  const displayWeight = currentVariety?.weight || product?.weight || "1 kg";

  const activeProductForPurchase: Product = useMemo(() => {
    if (!product) return product as unknown as Product;
    return {
      ...product,
      name: displayTitle,
      price: displayPrice,
      image: product.image || currentImage,
      origin: displayOrigin,
      seller: displaySeller,
      weight: displayWeight,
    };
  }, [product, displayTitle, displayPrice, displayOrigin, displaySeller, displayWeight, currentImage]);

  if (isProductLoading) {
    return (
      <>
        <TopBar />
        <Navbar />
        <main className="product-detail-page">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", flexDirection: "column", gap: "16px" }}>
            <Loader2 className="animate-spin" size={36} color="#16a34a" />
            <p style={{ color: "#6b7280" }}>Loading product details…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <TopBar />
        <Navbar />
        <main className="product-detail-page">
          <div className="product-not-found">
            <h1>Product not found</h1>
            <p>This product is not available right now.</p>
            <Link to="/shop">Back to shop</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const details = getProductDetails(product.id, product.name);
  const displaySummary = currentVariety?.description || details.about;

  return (
    <>
      <TopBar />
      <Navbar />

      <main className="product-detail-page">
        <div className="product-detail-container">
          {/* Breadcrumb matching reference screenshot */}
          <nav className="product-detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">
              <Home size={18} strokeWidth={2} className="breadcrumb-home-icon" />
              <span>Home</span>
            </Link>
            <ChevronRight size={14} strokeWidth={2.4} className="breadcrumb-separator" />
            <Link
              to={`/categories?category=${encodeURIComponent(product.category)}`}
              className="breadcrumb-link"
            >
              <span>{product.category}</span>
            </Link>
            <ChevronRight size={14} strokeWidth={2.4} className="breadcrumb-separator" />
            <span className="breadcrumb-current">{product.name}</span>
          </nav>

          {/* Hero Section matching screenshot */}
          <section className="product-detail-hero-layout">
            {/* Left Column: Main Image + 4 Cube Variety Boxes */}
            <div className="product-gallery-column">
              <div className="product-main-image-box">
                <img
                  src={currentImage}
                  alt={displayTitle}
                  onError={(e) => {
                    e.currentTarget.src =
                      product.image ||
                      "/src/frontend/assets/images/organic-vegetables.jpg";
                  }}
                />
                <button
                  type="button"
                  className={`product-wishlist-pill ${isLoggedIn && isInWishlist(product.id) ? "active" : ""}`}
                  aria-label={
                    isLoggedIn && isInWishlist(product.id)
                      ? `Remove ${product.name} from wishlist`
                      : `Add ${product.name} to wishlist`
                  }
                  onClick={() => {
                    if (!allow("wishlist-add", product)) return;
                    toggleWishlist(product);
                  }}
                >
                  <Heart
                    size={18}
                    fill={isLoggedIn && isInWishlist(product.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Four Cube Size Boxes with Product Angles / Perspectives */}
              <div className="product-variety-cubes" role="region" aria-label="Product angle gallery">
                {varietiesList.map((variety, index) => {
                  const isSelected = selectedVarietyIndex === index;
                  return (
                    <button
                      key={variety.id || `variety-${index}`}
                      type="button"
                      className={`product-variety-cube ${isSelected ? "active" : ""}`}
                      onClick={() => setSelectedVarietyIndex(index)}
                      title={variety.name}
                      aria-label={`Select angle: ${variety.name}`}
                    >
                      <img
                        src={variety.thumb || variety.image}
                        alt={variety.name}
                        onError={(e) => {
                          e.currentTarget.src =
                            product.image ||
                            "/src/frontend/assets/images/organic-vegetables.jpg";
                        }}
                      />
                      <span className="variety-cube-tag">{variety.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Title, Ratings, Price, Tags, Origin/Seller, Qty, Buttons */}
            <div className="product-detail-info-column">
              <h1 className="product-detail-title">{displayTitle}</h1>

              {/* Rating Row */}
              <div className="product-detail-rating-row">
                <div className="rating-stars" aria-label="Rating: 4.8 out of 5 stars">
                  <Star size={17} fill="#f5a623" stroke="#f5a623" />
                  <Star size={17} fill="#f5a623" stroke="#f5a623" />
                  <Star size={17} fill="#f5a623" stroke="#f5a623" />
                  <Star size={17} fill="#f5a623" stroke="#f5a623" />
                  <Star size={17} fill="none" stroke="#f5a623" />
                </div>
                <span className="rating-text">
                  4.8 ({details.reviewCount || 24} reviews)
                </span>
              </div>

              {/* Price Row: Rs. 150 /kg */}
              <div className="product-detail-price-row">
                <span className="price-amount">Rs. {displayPrice}</span>
                <span className="price-unit">/{displayWeight}</span>
              </div>

              {/* Pill Tags: Fresh, Organic, Locally Sourced */}
              <div className="product-detail-pill-tags">
                <span className="pill-tag">Fresh</span>
                <span className="pill-tag">Organic</span>
                <span className="pill-tag">Locally Sourced</span>
              </div>

              {/* Product description summary */}
              <p className="product-detail-desc">{displaySummary}</p>

              {/* Origin & Seller Bar Card */}
              <div className="product-detail-origin-card">
                <div className="origin-seller-block">
                  <div className="origin-seller-icon" aria-hidden="true">
                    <MapPin size={16} />
                  </div>
                  <div className="origin-seller-text">
                    <span className="os-label">Origin</span>
                    <strong className="os-value">{displayOrigin}</strong>
                  </div>
                </div>

                <div className="origin-seller-divider" aria-hidden="true" />

                <div className="origin-seller-block">
                  <div className="origin-seller-icon" aria-hidden="true">
                    <UserRound size={16} />
                  </div>
                  <div className="origin-seller-text">
                    <span className="os-label">Seller</span>
                    <strong className="os-value">{displaySeller}</strong>
                  </div>
                </div>
              </div>

              {/* Quantity Selector: − 1 kg + */}
              <div className="product-detail-qty-row">
                <span className="qty-label">Quantity</span>
                <div className="qty-capsule">
                  <button
                    type="button"
                    onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} strokeWidth={2.5} />
                  </button>
                  <span className="qty-value">
                    {quantity} {displayWeight.toLowerCase().includes("dozen") ? "dozen" : displayWeight.toLowerCase().includes("l") && !displayWeight.toLowerCase().includes("ml") ? "L" : displayWeight.toLowerCase().includes("pack") ? "pack" : "kg"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((v) => v + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Green Add To Cart + Orange Buy Now */}
              <div className="product-detail-action-buttons">
                <button
                  type="button"
                  className="btn-detail-add-cart"
                  onClick={() => {
                    if (!allow("cart-add", activeProductForPurchase, quantity)) return;
                    addToCart(activeProductForPurchase, quantity);
                  }}
                >
                  <ShoppingCart size={18} strokeWidth={2.2} />
                  <span>Add To Cart</span>
                </button>

                <button
                  type="button"
                  className="btn-detail-buy-now"
                  onClick={() => {
                    if (!allow("buy", activeProductForPurchase, quantity)) return;
                    beginBuyNow(activeProductForPurchase, quantity);
                    navigate("/checkout");
                  }}
                >
                  <ShoppingBag size={18} strokeWidth={2.2} />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </section>

          {/* Bottom Specs Card matching screenshot */}
          <section className="product-detail-specs-card">
            <div className="detail-tabs-header">
              <button
                type="button"
                className={`detail-tab-btn ${activeTab === "about" ? "active" : ""}`}
                onClick={() => setActiveTab("about")}
              >
                About this product
              </button>
              <button
                type="button"
                className={`detail-tab-btn ${activeTab === "nutrition" ? "active" : ""}`}
                onClick={() => setActiveTab("nutrition")}
              >
                Nutritional Information
              </button>
              <button
                type="button"
                className={`detail-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({details.reviewCount || reviews.length || 24})
              </button>
            </div>

            {/* About Tab View */}
            {activeTab === "about" && (
              <div className="detail-specs-content">
                <div className="specs-top-row">
                  <div className="specs-about-col">
                    <h3 className="specs-heading">About this product</h3>
                    <p className="specs-paragraph">
                      {currentVariety?.description ||
                        details.about ||
                        "Our fresh products are carefully selected from trusted local farms. They are rich in essential nutrients, naturally sweet and perfect for a healthy lifestyle. Enjoy them as a snack, in your breakfast or in your favourite recipes."}
                    </p>
                  </div>

                  <div className="key-benefits-card">
                    <h4 className="key-benefits-heading">Key Benefits</h4>
                    <ul className="key-benefits-list">
                      <li>
                        <Scissors size={15} strokeWidth={2} />
                        <span>Freshly harvested</span>
                      </li>
                      <li>
                        <MapPin size={15} strokeWidth={2} />
                        <span>Locally sourced</span>
                      </li>
                      <li>
                        <AlertTriangle size={15} strokeWidth={2} />
                        <span>Quality checked</span>
                      </li>
                      <li>
                        <Truck size={15} strokeWidth={2} />
                        <span>Farm-to-door delievery</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Nutritional Information (per 100g) */}
                <div className="nutrition-summary-card">
                  <h4 className="nutrition-summary-heading">
                    Nutritional Information <small>(per 100g)</small>
                  </h4>
                  <div className="nutrition-columns-grid">
                    <div className="nutrition-col">
                      <div className="nut-circle" aria-hidden="true" />
                      <div className="nut-info">
                        <span className="nut-label">Calories</span>
                        <strong className="nut-value">
                          {details.calories || "52 kcal"}
                        </strong>
                      </div>
                    </div>

                    <div className="nut-divider" aria-hidden="true" />

                    <div className="nutrition-col">
                      <div className="nut-circle" aria-hidden="true" />
                      <div className="nut-info">
                        <span className="nut-label">Protein</span>
                        <strong className="nut-value">
                          {details.protein || "0.3 g"}
                        </strong>
                      </div>
                    </div>

                    <div className="nut-divider" aria-hidden="true" />

                    <div className="nutrition-col">
                      <div className="nut-circle" aria-hidden="true" />
                      <div className="nut-info">
                        <span className="nut-label">Fiber</span>
                        <strong className="nut-value">
                          {details.fiber || "2.4 g"}
                        </strong>
                      </div>
                    </div>

                    <div className="nut-divider" aria-hidden="true" />

                    <div className="nutrition-col">
                      <div className="nut-circle" aria-hidden="true" />
                      <div className="nut-info">
                        <span className="nut-label">Vitamin C</span>
                        <strong className="nut-value">
                          {details.vitaminC || "4.6 mg"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nutrition Tab View */}
            {activeTab === "nutrition" && (
              <div className="detail-specs-content">
                <div className="nutrition-summary-card" style={{ marginTop: 0 }}>
                  <h4 className="nutrition-summary-heading">
                    Nutritional Information <small>(per 100g)</small>
                  </h4>
                  <div className="nutrition-columns-grid">
                    <div className="nutrition-col">
                      <div className="nut-circle" aria-hidden="true" />
                      <div className="nut-info">
                        <span className="nut-label">Calories</span>
                        <strong className="nut-value">
                          {details.calories || "52 kcal"}
                        </strong>
                      </div>
                    </div>
                    <div className="nut-divider" aria-hidden="true" />
                    <div className="nutrition-col">
                      <div className="nut-circle" aria-hidden="true" />
                      <div className="nut-info">
                        <span className="nut-label">Protein</span>
                        <strong className="nut-value">
                          {details.protein || "0.3 g"}
                        </strong>
                      </div>
                    </div>
                    <div className="nut-divider" aria-hidden="true" />
                    <div className="nutrition-col">
                      <div className="nut-circle" aria-hidden="true" />
                      <div className="nut-info">
                        <span className="nut-label">Fiber</span>
                        <strong className="nut-value">
                          {details.fiber || "2.4 g"}
                        </strong>
                      </div>
                    </div>
                    <div className="nut-divider" aria-hidden="true" />
                    <div className="nutrition-col">
                      <div className="nut-circle" aria-hidden="true" />
                      <div className="nut-info">
                        <span className="nut-label">Vitamin C</span>
                        <strong className="nut-value">
                          {details.vitaminC || "4.6 mg"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab View */}
            {activeTab === "reviews" && (
              <div className="product-reviews-panel">
                <h2>Customer Reviews ({reviews.length})</h2>

                {reviewsLoading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#6b7280",
                      padding: "20px 0",
                    }}
                  >
                    <Loader2 size={20} className="spin" /> Loading reviews…
                  </div>
                ) : reviews.length === 0 ? (
                  <p style={{ color: "#6b7280", marginBottom: 24 }}>
                    No reviews yet. Be the first to review this product!
                  </p>
                ) : (
                  <ul className="review-list">
                    {reviews.map((rev) => (
                      <li key={rev.id} className="review-item">
                        <div className="review-meta">
                          {rev.photo ? (
                            <img
                              src={rev.photo}
                              alt={rev.first_name}
                              className="review-avatar"
                            />
                          ) : (
                            <span className="review-avatar-placeholder">
                              <UserRound size={18} />
                            </span>
                          )}
                          <div>
                            <strong>
                              {rev.first_name} {rev.last_name}
                            </strong>
                            <div className="review-stars">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i < rev.rating ? "#f59e0b" : "none"}
                                  stroke="#f59e0b"
                                />
                              ))}
                            </div>
                            <span className="review-date">
                              {new Date(rev.created_at).toLocaleDateString("en-NP", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        {rev.title && <strong className="review-title">{rev.title}</strong>}
                        {rev.body && <p className="review-body">{rev.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}

                {isLoggedIn ? (
                  <form className="review-form" onSubmit={handleSubmitReview}>
                    <h3>Write a review</h3>
                    {reviewSuccess && (
                      <p className="review-success">✅ Your review was submitted!</p>
                    )}
                    {reviewError && <p className="review-error">{reviewError}</p>}

                    <label className="review-field">
                      <span>Rating</span>
                      <div className="review-star-picker">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 2,
                            }}
                          >
                            <Star
                              size={24}
                              fill={star <= reviewRating ? "#f59e0b" : "none"}
                              stroke="#f59e0b"
                            />
                          </button>
                        ))}
                      </div>
                    </label>

                    <label className="review-field">
                      <span>Title (optional)</span>
                      <input
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="e.g. Excellent quality!"
                        maxLength={80}
                      />
                    </label>

                    <label className="review-field">
                      <span>Review</span>
                      <textarea
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="submit-review-btn"
                    >
                      {reviewSubmitting ? "Submitting…" : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <p style={{ marginTop: 16 }}>
                    <Link
                      to="/login"
                      style={{ color: "#277a4e", fontWeight: 600, textDecoration: "underline" }}
                    >
                      Sign in
                    </Link>{" "}
                    to write a review.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        <WhyChooseUs />
        <PopularProducts />
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}

export default ProductDetail;
