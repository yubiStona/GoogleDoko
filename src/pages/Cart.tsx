import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, Tag } from "lucide-react";

import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { api } from "../api/client";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { useCheckout } from "../context/CheckoutContext";
import {
  resolveProductSellingUnit,
  isLifestyleCategory,
} from "../utils/productUnits";

function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem } = useCart();
  const { beginCheckout } = useCheckout();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  /* ========================================
       PRICE CALCULATIONS (Server-grounded)
    ======================================== */

  const subtotal = cartItems.reduce((total, item) => {
    const catalogItem = products.find((p) => p.id === item.id);
    const price =
      typeof item.price === "number" && !isNaN(item.price) && item.price > 0
        ? item.price
        : catalogItem?.price || 0;
    const qty =
      typeof item.quantity === "number" && !isNaN(item.quantity) && item.quantity > 0
        ? item.quantity
        : 1;
    return total + price * qty;
  }, 0);

  const discountAmount = promoDiscount;
  const deliveryFee = cartItems.length > 0 ? (subtotal >= 1500 ? 0 : 50) : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  async function handleApplyPromo() {
    const trimmed = promoCode.trim().toUpperCase();
    if (!trimmed) {
      setPromoMessage({ text: "Please enter a promo code", isError: true });
      return;
    }
    setValidatingPromo(true);
    try {
      const res = await api.validateCoupon(trimmed, subtotal);
      if (res.valid) {
        setAppliedPromo(res.code);
        setPromoDiscount(res.discountAmount);
        setPromoMessage({ text: res.message || `Promo code "${res.code}" applied!`, isError: false });
      } else {
        setPromoMessage({ text: res.error || `Invalid coupon "${trimmed}"`, isError: true });
      }
    } catch (err: any) {
      setPromoMessage({
        text: err.message || `Invalid code "${trimmed}". Try using WELCOME10 for 10% off.`,
        isError: true,
      });
    } finally {
      setValidatingPromo(false);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoCode("");
    setPromoMessage(null);
  }

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <TopBar />
      <Navbar />

      <main className="cart-page">
        <div className="cart-container">
          {/* ========================================
              PAGE HEADING
          ======================================== */}

          <div className="cart-heading">
            <h1>Your Cart</h1>

            <p>{itemCount} items in your cart</p>
          </div>

          {/* ========================================
              MAIN LAYOUT
          ======================================== */}

          <div className="cart-layout">
            {/* ======================================
                LEFT — CART ITEMS
            ====================================== */}

            <section className="cart-items">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <h2>Your cart is empty</h2>

                  <p>Add some products to your cart to continue shopping.</p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const catalogItem = products.find((p) => p.id === item.id);
                  const name =
                    (item.name && item.name !== "Product" ? item.name : undefined) ||
                    catalogItem?.name ||
                    item.name ||
                    "Product";
                  const weight = item.weight || catalogItem?.weight || "1 kg";
                  const price =
                    typeof item.price === "number" && !isNaN(item.price) && item.price > 0
                      ? item.price
                      : catalogItem?.price || 0;
                  const quantity = Math.max(
                    1,
                    typeof item.quantity === "number" && !isNaN(item.quantity)
                      ? item.quantity
                      : 1,
                  );
                  const lineTotal = price * quantity;
                  const origin = item.origin || catalogItem?.origin || "";
                  const category = item.category || catalogItem?.category || "";
                  const sellingUnit = resolveProductSellingUnit(category, item.sellingUnit, weight);
                  const isLifestyle = isLifestyleCategory(category);

                  let imageSrc = item.image || catalogItem?.image || "";
                  if (imageSrc.startsWith("/src/frontend/assets/")) {
                    imageSrc = imageSrc.replace("/src/frontend/assets/", "/src/assets/");
                  }
                  if (!imageSrc) {
                    const key = name.toLowerCase().trim();
                    imageSrc = `/src/assets/images/products/${key}.jpg`;
                  }

                  return (
                    <article className="cart-item" key={item.id}>
                      {/* PRODUCT IMAGE */}
                      <div className="cart-item-image">
                        <img
                          src={imageSrc}
                          alt={name}
                          onError={(event) => {
                            const target = event.currentTarget;
                            if (!target.dataset.triedFallback) {
                              target.dataset.triedFallback = "1";
                              target.src = "/src/assets/images/organic-vegetables.jpg";
                            } else {
                              target.style.display = "none";
                            }
                          }}
                        />
                      </div>

                      {/* PRODUCT INFORMATION */}
                      <div className="cart-item-info">
                        <h3>{name}</h3>

                        {origin ? (
                          <span className="cart-item-origin">{origin}</span>
                        ) : null}

                        {item.variant ? (
                          <span style={{ fontSize: 12, color: "#168d51", fontWeight: 600, display: "block" }}>
                            Option: {item.variant.name || item.variant}
                          </span>
                        ) : isLifestyle ? null : (
                          <strong>{weight}</strong>
                        )}

                        <span className="cart-item-price">
                          Rs. {price.toLocaleString()} / {sellingUnit}
                        </span>
                      </div>

                      {/* QUANTITY */}
                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      {/* ITEM TOTAL */}
                      <div className="cart-item-total">
                        Rs. {lineTotal.toLocaleString()}
                      </div>

                      {/* DELETE */}
                      <button
                        type="button"
                        className="remove-cart-item"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${name}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </article>
                  );
                })
              )}
            </section>

            {/* ======================================
                RIGHT — SIDEBAR
            ====================================== */}

            <aside className="cart-sidebar">
              {/* ====================================
                  PRICE DETAILS
              ==================================== */}

              <section className="price-details">
                <h2>Price Details</h2>

                <div className="price-row">
                  <span>Sub total</span>

                  <strong>Rs. {subtotal.toLocaleString()}</strong>
                </div>

                <div className="price-row">
                  <span>Delivery Fee</span>

                  <strong>Rs. {deliveryFee}</strong>
                </div>

                {appliedPromo && (
                  <div className="price-row" style={{ color: "#168d51" }}>
                    <span>Promo Discount (10%)</span>
                    <strong>-Rs. {discountAmount.toLocaleString()}</strong>
                  </div>
                )}

                <div className="price-divider" />

                <div className="total-row">
                  <span>Total</span>

                  <strong>Rs. {total.toLocaleString()}</strong>
                </div>

                <div className="cart-payment-action">
                  <button
                    type="button"
                    className="cart-proceed-btn"
                    disabled={cartItems.length === 0}
                    onClick={() => {
                      beginCheckout(cartItems, true, appliedPromo || undefined);
                      navigate("/checkout");
                    }}
                  >
                    Proceed to Checkout →
                  </button>

                  <p className="cart-payment-safe">
                    Your payment information is safe and secure
                  </p>
                </div>
              </section>

              {/* ====================================
                  PROMO CODE
              ==================================== */}

              <section className="promo-section">
                <h3>Have a promo code? Enter code and get discount</h3>

                <div className="promo-box">
                  <div className="promo-icon">
                    <Tag size={20} />
                  </div>

                  <input
                    type="text"
                    placeholder="e.g. WELCOME10 or FRESHFARM"
                    value={promoCode}
                    disabled={Boolean(appliedPromo) || validatingPromo}
                    onChange={(event) => setPromoCode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleApplyPromo();
                      }
                    }}
                  />

                  {appliedPromo ? (
                    <button
                      type="button"
                      className="promo-apply-button"
                      style={{ background: "#c44545" }}
                      onClick={handleRemovePromo}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="promo-apply-button"
                      onClick={handleApplyPromo}
                      disabled={validatingPromo}
                    >
                      {validatingPromo ? "Verifying..." : "Apply"}
                    </button>
                  )}
                </div>

                {promoMessage && (
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 13,
                      fontWeight: 600,
                      color: promoMessage.isError ? "#c44545" : "#168d51",
                    }}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </section>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Cart;
