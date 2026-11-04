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
  ThumbsUp,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
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
import {
  api,
  type ProductReviewsResponse,
} from "../api/client";
import ReviewModal from "../components/review/ReviewModal";
import {
  resolveProductSellingUnit,
  formatQuantityWithUnit,
  isLifestyleCategory,
  isDecimalAllowedForUnit,
} from "../utils/productUnits";

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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("about");

  // Reviews state
  const [reviewsResponse, setReviewsResponse] = useState<ProductReviewsResponse | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsSort, setReviewsSort] = useState("newest");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReviewData, setEditingReviewData] = useState<any>(null);

  const fetchReviews = useCallback(() => {
    if (!id) return;
    setReviewsLoading(true);
    api
      .getProductReviews(id, { sort: reviewsSort })
      .then((res: any) => {
        // Support array fallback for backwards compatibility or full object
        if (Array.isArray(res)) {
          setReviewsResponse({
            reviews: res,
            stats: {
              averageRating: 4.8,
              totalReviews: res.length,
              distribution: { 5: { count: res.length, percentage: 100 }, 4: { count: 0, percentage: 0 }, 3: { count: 0, percentage: 0 }, 2: { count: 0, percentage: 0 }, 1: { count: 0, percentage: 0 } },
            },
            pagination: { total: res.length, page: 1, limit: 10, totalPages: 1 },
          });
        } else {
          setReviewsResponse(res);
        }
      })
      .catch(() => setReviewsResponse(null))
      .finally(() => setReviewsLoading(false));
  }, [id, reviewsSort]);

  useEffect(() => {
    if (activeTab === "reviews") fetchReviews();
  }, [activeTab, fetchReviews]);

  async function handleVoteHelpful(reviewId: number) {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      const res = await api.voteReviewHelpful(reviewId);
      setReviewsResponse((current) => {
        if (!current) return null;
        return {
          ...current,
          reviews: current.reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpfulCount: res.helpfulCount,
                  userHasVotedHelpful: res.helpful,
                }
              : r
          ),
        };
      });
    } catch (err: any) {
      console.warn("Could not vote helpful:", err);
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
    setSelectedVariantId(null);
    setQuantity(1);
  }, [id]);

  const productVariants = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }
    if (product.variantsJson) {
      try {
        const parsed = JSON.parse(product.variantsJson);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [];
  }, [product]);

  const activeVariant = useMemo(() => {
    if (productVariants.length === 0) return null;
    return productVariants.find((v: any) => v.id === selectedVariantId) || productVariants[0];
  }, [productVariants, selectedVariantId]);

  const effectiveSellingUnit = useMemo(() => {
    return resolveProductSellingUnit(
      product?.category,
      product?.sellingUnit,
      product?.weight
    );
  }, [product]);

  const isLifestyle = useMemo(() => {
    return isLifestyleCategory(product?.category);
  }, [product]);

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
  const displayPrice = activeVariant?.price ?? (currentVariety?.price || product?.price || 0);
  const availableStock = activeVariant?.stock ?? (product?.stock ?? 100);
  const displayOrigin = currentVariety?.origin || product?.origin || "Nepal";
  const displaySeller = currentVariety?.seller || product?.seller || "Local Farm";
  const displayWeight = currentVariety?.weight || product?.weight || "1 kg";

  const activeProductForPurchase: Product = useMemo(() => {
    if (!product) return product as unknown as Product;
    return {
      ...product,
      name: activeVariant ? `${displayTitle} (${activeVariant.name})` : displayTitle,
      price: displayPrice,
      sellingUnit: effectiveSellingUnit,
      allowDecimals: product.allowDecimals ?? (isDecimalAllowedForUnit(effectiveSellingUnit) ? 1 : 0),
      selectedVariant: activeVariant || undefined,
      image: product.image || currentImage,
      origin: displayOrigin,
      seller: displaySeller,
      weight: displayWeight,
      stock: availableStock,
    };
  }, [
    product,
    displayTitle,
    displayPrice,
    effectiveSellingUnit,
    activeVariant,
    displayOrigin,
    displaySeller,
    displayWeight,
    currentImage,
    availableStock,
  ]);

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

              {/* Price Row: Category-Aware Selling Unit */}
              <div className="product-detail-price-row">
                <span className="price-amount">Rs. {displayPrice.toLocaleString()}</span>
                <span className="price-unit">/ {effectiveSellingUnit}</span>
              </div>

              {/* Pill Tags: Category-Aware */}
              <div className="product-detail-pill-tags">
                {isLifestyle ? (
                  <>
                    <span className="pill-tag">Handcrafted</span>
                    <span className="pill-tag">Artisan Made</span>
                    <span className="pill-tag">Authentic Nepali</span>
                  </>
                ) : (
                  <>
                    <span className="pill-tag">Fresh</span>
                    <span className="pill-tag">Organic</span>
                    <span className="pill-tag">Locally Sourced</span>
                  </>
                )}
              </div>

              {/* Product description summary */}
              <p className="product-detail-desc">{displaySummary}</p>

              {/* Product Variants (e.g. Size, Color) */}
              {productVariants.length > 0 && (
                <div style={{ marginTop: 14, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                    Select Option ({productVariants[0]?.optionType || "Variant"}):
                  </span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {productVariants.map((v: any) => {
                      const isSelected = activeVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariantId(v.id);
                            setQuantity(1);
                          }}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 6,
                            border: isSelected ? "2px solid #168d51" : "1px solid #d1d5db",
                            background: isSelected ? "#edf8f0" : "#ffffff",
                            color: isSelected ? "#0f5431" : "#374151",
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          {v.name} {v.price ? `(Rs. ${v.price.toLocaleString()})` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Stock Indicator */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: availableStock > 0 ? "#168d51" : "#dc2626",
                  marginTop: 6,
                  marginBottom: 10,
                }}
              >
                {availableStock > 0
                  ? `Available stock: ${availableStock} ${effectiveSellingUnit}${availableStock > 1 && !["kg", "g", "ml"].includes(effectiveSellingUnit) ? "s" : ""}`
                  : "Out of stock"}
              </div>

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

              {/* Quantity Selector */}
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
                    {formatQuantityWithUnit(quantity, effectiveSellingUnit, product.category)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((v) => Math.min(availableStock || 999, v + 1))}
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>

                <span style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginLeft: 14 }}>
                  Total: Rs. {(displayPrice * quantity).toLocaleString()}
                </span>
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
                {isLifestyle ? "Specifications & Craft" : "Nutritional Information"}
              </button>
              <button
                type="button"
                className={`detail-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({reviewsResponse?.stats?.totalReviews ?? details.reviewCount ?? 24})
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

                {/* Product Specifications or Nutrition (per 100g) */}
                {isLifestyle ? (
                  <div className="nutrition-summary-card">
                    <h4 className="nutrition-summary-heading">
                      Product Specifications &amp; Material
                    </h4>
                    <div className="nutrition-columns-grid">
                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Selling Unit</span>
                          <strong className="nut-value">Per {effectiveSellingUnit}</strong>
                        </div>
                      </div>

                      <div className="nut-divider" aria-hidden="true" />

                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Weight / Dimensions</span>
                          <strong className="nut-value">{displayWeight || "Crafted to scale"}</strong>
                        </div>
                      </div>

                      <div className="nut-divider" aria-hidden="true" />

                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Category</span>
                          <strong className="nut-value">{product.category}</strong>
                        </div>
                      </div>

                      <div className="nut-divider" aria-hidden="true" />

                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Artisan Guild</span>
                          <strong className="nut-value">{displaySeller}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="nutrition-summary-card">
                    <h4 className="nutrition-summary-heading">
                      Nutritional Information <small>(per 100g)</small>
                    </h4>
                    <div className="nutrition-columns-grid">
                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Calories</span>
                          <strong className="nut-value">{details.calories || "52 kcal"}</strong>
                        </div>
                      </div>

                      <div className="nut-divider" aria-hidden="true" />

                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Protein</span>
                          <strong className="nut-value">{details.protein || "0.3 g"}</strong>
                        </div>
                      </div>

                      <div className="nut-divider" aria-hidden="true" />

                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Fiber</span>
                          <strong className="nut-value">{details.fiber || "2.4 g"}</strong>
                        </div>
                      </div>

                      <div className="nut-divider" aria-hidden="true" />

                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Vitamin C</span>
                          <strong className="nut-value">{details.vitaminC || "4.6 mg"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nutrition or Specifications Tab View */}
            {activeTab === "nutrition" && (
              <div className="detail-specs-content">
                {isLifestyle ? (
                  <div className="nutrition-summary-card" style={{ marginTop: 0 }}>
                    <h4 className="nutrition-summary-heading">
                      Artisan Craftsmanship &amp; Technical Specifications
                    </h4>
                    <div style={{ padding: "16px 0", color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
                      <p style={{ marginBottom: 12 }}>
                        <strong>Authentic Craftsmanship:</strong> Handcrafted by experienced artisans using indigenous raw materials, traditional joinery, and durable finishes.
                      </p>
                      <p style={{ marginBottom: 12 }}>
                        <strong>Selling &amp; Order Unit:</strong> Priced and sold <strong>per {effectiveSellingUnit}</strong>. Quantity ordered represents complete individual {effectiveSellingUnit}s.
                      </p>
                      <p style={{ marginBottom: 12 }}>
                        <strong>Dimensions &amp; Physical Weight:</strong> {displayWeight || "Standard size crafted by local artisans"}.
                      </p>
                      <p>
                        <strong>Care &amp; Maintenance:</strong> Wipe with a clean, dry or damp cloth. Avoid harsh abrasive cleaners to preserve the natural textures and finishes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="nutrition-summary-card" style={{ marginTop: 0 }}>
                    <h4 className="nutrition-summary-heading">
                      Nutritional Information <small>(per 100g)</small>
                    </h4>
                    <div className="nutrition-columns-grid">
                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Calories</span>
                          <strong className="nut-value">{details.calories || "52 kcal"}</strong>
                        </div>
                      </div>
                      <div className="nut-divider" aria-hidden="true" />
                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Protein</span>
                          <strong className="nut-value">{details.protein || "0.3 g"}</strong>
                        </div>
                      </div>
                      <div className="nut-divider" aria-hidden="true" />
                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Fiber</span>
                          <strong className="nut-value">{details.fiber || "2.4 g"}</strong>
                        </div>
                      </div>
                      <div className="nut-divider" aria-hidden="true" />
                      <div className="nutrition-col">
                        <div className="nut-circle" aria-hidden="true" />
                        <div className="nut-info">
                          <span className="nut-label">Vitamin C</span>
                          <strong className="nut-value">{details.vitaminC || "4.6 mg"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab View */}
            {activeTab === "reviews" && (
              <div className="product-reviews-panel">
                <div className="reviews-panel-header">
                  <div>
                    <h2>Customer Ratings &amp; Reviews</h2>
                    <p className="reviews-panel-subtitle">
                      Verified customer feedback from real farm harvest orders
                    </p>
                  </div>
                </div>

                {/* Rating Breakdown Summary Card */}
                {reviewsResponse?.stats && (
                  <div className="review-breakdown-card">
                    <div className="review-breakdown-score">
                      <div className="score-big">
                        {reviewsResponse.stats.averageRating > 0
                          ? reviewsResponse.stats.averageRating.toFixed(1)
                          : "4.8"}
                      </div>
                      <div className="score-stars">
                        {Array.from({ length: 5 }, (_, i) => {
                          const ratingVal =
                            reviewsResponse.stats.averageRating > 0
                              ? reviewsResponse.stats.averageRating
                              : 4.8;
                          return (
                            <Star
                              key={i}
                              size={18}
                              fill={i < Math.floor(ratingVal) ? "#f59e0b" : "none"}
                              stroke="#f59e0b"
                            />
                          );
                        })}
                      </div>
                      <span className="score-count">
                        Based on {reviewsResponse.stats.totalReviews} verified ratings
                      </span>
                    </div>

                    <div className="review-breakdown-bars">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const dist = reviewsResponse.stats.distribution[star as 1 | 2 | 3 | 4 | 5];
                        const count = dist?.count || 0;
                        const pct = dist?.percentage || 0;
                        return (
                          <div key={star} className="rating-bar-row">
                            <span className="rating-bar-label">{star} stars</span>
                            <div className="rating-bar-track">
                              <div
                                className="rating-bar-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="rating-bar-pct">{pct}%</span>
                            <span className="rating-bar-count">({count})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Review Eligibility & Action Banner */}
                <div className="review-eligibility-banner">
                  {isLoggedIn ? (
                    reviewsResponse?.userEligibility?.isEligible ? (
                      <div className="eligibility-box is-eligible">
                        <div className="eligibility-content">
                          <CheckCircle2 size={20} className="eligibility-icon success" />
                          <div>
                            <strong>Verified Purchase Delivered</strong>
                            <p>
                              You received this product on order #{reviewsResponse.userEligibility.eligibleOrderId}.
                              Share your feedback with fellow shoppers.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="write-review-btn"
                          onClick={() => {
                            setEditingReviewData(null);
                            setReviewModalOpen(true);
                          }}
                        >
                          Write a Review
                        </button>
                      </div>
                    ) : reviewsResponse?.userEligibility?.alreadyReviewed ? (
                      <div className="eligibility-box is-reviewed">
                        <div className="eligibility-content">
                          <CheckCircle2 size={20} className="eligibility-icon success" />
                          <div>
                            <strong>You've reviewed this product!</strong>
                            <p>
                              Your verified review is published. You can edit your comments or star rating at any time.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="edit-review-btn"
                          onClick={() => {
                            setEditingReviewData(reviewsResponse.userEligibility?.existingReview);
                            setReviewModalOpen(true);
                          }}
                        >
                          Edit Your Review
                        </button>
                      </div>
                    ) : (
                      <div className="eligibility-box is-ineligible">
                        <ShieldCheck size={20} className="eligibility-icon notice" />
                        <div>
                          <strong>Verified Purchases Only</strong>
                          <p>
                            To maintain authentic ratings, reviews can only be submitted after your order containing this product has been successfully delivered.
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="eligibility-box is-guest">
                      <ShieldCheck size={20} className="eligibility-icon notice" />
                      <div>
                        <strong>Have you purchased this product?</strong>
                        <p>
                          <Link to="/login" className="login-link">Sign in</Link> to check your delivery status and submit your verified review.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews Filter & Toolbar */}
                <div className="reviews-list-toolbar">
                  <h3>
                    All Reviews ({reviewsResponse?.stats.totalReviews ?? reviewsResponse?.reviews.length ?? 0})
                  </h3>
                  <div className="reviews-sort-wrap">
                    <label htmlFor="reviews-sort">Sort by:</label>
                    <select
                      id="reviews-sort"
                      value={reviewsSort}
                      onChange={(e) => setReviewsSort(e.target.value)}
                      className="reviews-sort-select"
                    >
                      <option value="newest">Most Recent</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                      <option value="helpful">Most Helpful</option>
                    </select>
                  </div>
                </div>

                {reviewsLoading ? (
                  <div className="reviews-loading-state">
                    <Loader2 size={22} className="spin" /> Loading customer reviews...
                  </div>
                ) : !reviewsResponse?.reviews || reviewsResponse.reviews.length === 0 ? (
                  <div className="reviews-empty-state">
                    <MessageSquare size={36} color="#94a3b8" />
                    <h4>No reviews published yet</h4>
                    <p>Be the first verified customer to share your thoughts on this harvest.</p>
                  </div>
                ) : (
                  <div className="reviews-items-container">
                    {reviewsResponse.reviews.map((rev) => (
                      <article key={rev.id} className="review-card-item">
                        <div className="review-card-top">
                          <div className="reviewer-info">
                            {rev.photo ? (
                              <img
                                src={rev.photo}
                                alt={rev.first_name || rev.author || "Reviewer"}
                                className="reviewer-avatar"
                              />
                            ) : (
                              <div className="reviewer-avatar-placeholder">
                                {(rev.first_name?.[0] || rev.author?.[0] || "U").toUpperCase()}
                              </div>
                            )}
                            <div>
                              <strong className="reviewer-name">
                                {rev.first_name
                                  ? `${rev.first_name} ${rev.last_name || ""}`.trim()
                                  : rev.author || "Verified Customer"}
                              </strong>
                              {rev.verifiedPurchase && (
                                <span className="verified-badge">
                                  <CheckCircle2 size={12} /> Verified Purchase
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="review-card-rating">
                            <div className="review-stars-row">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  size={15}
                                  fill={i < rev.rating ? "#f59e0b" : "none"}
                                  stroke="#f59e0b"
                                />
                              ))}
                            </div>
                            <span className="review-post-date">
                              {new Date(rev.created_at || rev.createdAt || Date.now()).toLocaleDateString("en-NP", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {rev.title && <h4 className="review-card-title">{rev.title}</h4>}
                        <p className="review-card-body">{rev.body}</p>

                        {/* Uploaded product images */}
                        {Array.isArray(rev.images) && rev.images.length > 0 && (
                          <div className="review-card-images">
                            {rev.images.map((imgUrl, idx) => (
                              <img
                                key={idx}
                                src={imgUrl}
                                alt={`Customer upload ${idx + 1}`}
                                className="review-thumbnail"
                              />
                            ))}
                          </div>
                        )}

                        {/* Vendor Reply */}
                        {rev.reply && (
                          <div className="review-vendor-reply">
                            <div className="vendor-reply-header">
                              <span className="vendor-reply-badge">Seller Response</span>
                              {rev.replyAt && (
                                <small>
                                  {new Date(rev.replyAt).toLocaleDateString("en-NP", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </small>
                              )}
                            </div>
                            <p>{rev.reply}</p>
                          </div>
                        )}

                        {/* Helpful Actions */}
                        <div className="review-card-actions">
                          <button
                            type="button"
                            className={`helpful-btn ${rev.userHasVotedHelpful ? "has-voted" : ""}`}
                            onClick={() => handleVoteHelpful(rev.id)}
                            title="Mark this review as helpful"
                          >
                            <ThumbsUp size={14} />
                            <span>Helpful</span>
                            {(rev.helpfulCount || 0) > 0 && (
                              <span className="helpful-count">({rev.helpfulCount})</span>
                            )}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Review Modal for Verified Customers */}
          {product && (
            <ReviewModal
              isOpen={reviewModalOpen}
              onClose={() => setReviewModalOpen(false)}
              productId={product.id}
              productName={product.name}
              productImage={product.image}
              orderId={reviewsResponse?.userEligibility?.eligibleOrderId}
              orderItemId={reviewsResponse?.userEligibility?.eligibleOrderItemId}
              existingReview={editingReviewData}
              onSuccess={fetchReviews}
            />
          )}
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
