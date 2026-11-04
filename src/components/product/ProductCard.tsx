import {
  ShoppingCart,
  Star,
  MapPin,
  UserRound,
  Heart,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { Product } from "../../data/products";
import { getProductBadge } from "../../data/productBadges";
import { useCart } from "../../context/CartContext";
import { useCheckout } from "../../context/CheckoutContext";
import { useWishlist } from "../../context/WishlistContext";
import { useShopAuth } from "../../hooks/useShopAuth";
import {
  resolveProductSellingUnit,
} from "../../utils/productUnits";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { beginBuyNow } = useCheckout();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { allow, isLoggedIn } = useShopAuth();
  const saved = isLoggedIn && isInWishlist(product.id);
  const badge = getProductBadge(product.name, product.category);
  const BadgeIcon = badge.icon;

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
    >

      {/* Product Image */}
      <div className="product-image-container">

        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.currentTarget.src = "/src/frontend/assets/images/organic-vegetables.jpg";
          }}
        />

        <button
          type="button"
          className={`product-wishlist-button ${saved ? "active" : ""}`}
          aria-label={
            saved
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          onClick={(event) => {
            event.stopPropagation();
            if (!allow("wishlist-add", product)) {
              return;
            }
            toggleWishlist(product);
          }}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>

        {/* Category Icon */}
        <div className={`product-category-icon ${badge.className}`}>
          <BadgeIcon size={38} strokeWidth={2} />
        </div>

      </div>


      {/* Product Information */}
      <div className="product-info">
        {(() => {
          const sellingUnit = resolveProductSellingUnit(
            product.category,
            product.sellingUnit,
            product.weight
          );
          // Concise measurement/unit badge for top-right (e.g. "200 g", "180 g", "1 piece", "1 kg")
          const formatBadge = (rawWeight?: string, unit?: string) => {
            if (rawWeight && rawWeight.trim().length > 0) {
              const clean = rawWeight.replace(/\s*\(Net Weight\)/i, "").trim();
              if (clean.length <= 10) return clean;
            }
            return unit ? `1 ${unit}` : "";
          };

          const displayBadgeText = formatBadge(product.weight, sellingUnit);

          return (
            <>
              {/* Name + Weight / Unit Badge */}
              <div className="product-title-row">
                <h3 title={product.name}>{product.name}</h3>
                {displayBadgeText && (
                  <span className="product-weight" title={displayBadgeText}>
                    {displayBadgeText}
                  </span>
                )}
              </div>

              {/* Price with Category-Aware Selling Unit */}
              <div className="product-price">
                Rs {product.price.toLocaleString()}{" "}
                <span style={{ fontSize: "0.85em", fontWeight: 500, color: "#64748b" }}>
                  / {sellingUnit}
                </span>
              </div>
            </>
          );
        })()}


        {/* Rating + Sold */}
        <div className="product-rating">

          <div className="rating">
            <Star
              size={18}
              fill="currentColor"
            />

            <span>
              {product.rating}
            </span>

            <span className="rating-count">
              ({product.sold})
            </span>
          </div>

          <span className="sold">
            {(Number(product.sold) || 0) + 192} + sold
          </span>

        </div>


        {/* Origin + Seller */}
        <div className="product-location-box">

          <div className="product-location">

            <MapPin size={18} />

            <div>
              <span>Origin</span>
              <strong>
                {product.origin}
              </strong>
            </div>

          </div>


          <div className="product-divider"></div>


          <div className="product-seller-info">

            <UserRound size={18} />

            <div>
              <span>Seller</span>
              <strong>
                {product.seller}
              </strong>
            </div>

          </div>

        </div>


        {/* Buttons */}
        <div className="product-actions">

          <button
            type="button"
            className="buy-button"
            onClick={(event) => {
              event.stopPropagation();
              if (!allow("buy", product, 1)) {
                return;
              }
              beginBuyNow(product, 1);
              navigate("/checkout");
            }}
          >
            Buy Now
          </button>

          <button
            type="button"
            className="add-cart-button"
            aria-label={`Add ${product.name} to cart`}
            onClick={(event) => {
              event.stopPropagation();
              if (!allow("cart-add", product, 1)) {
                return;
              }
              addToCart(product);
            }}
          >
            <ShoppingCart size={23} />
          </button>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;