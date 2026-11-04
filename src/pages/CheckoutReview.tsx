import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

import CheckoutShell from "../components/CheckoutShell";
import { paymentLabels, useCheckout } from "../context/CheckoutContext";
import { useAccount } from "../context/AccountContext";
import { useCart } from "../context/CartContext";
import { scrollToElement, mapBackendErrorToField } from "../utils/formErrorNavigation";
import {
  resolveProductSellingUnit,
  formatQuantityWithUnit,
} from "../utils/productUnits";

function CheckoutReview() {
  const navigate = useNavigate();
  const {
    items,
    form,
    paymentMethod,
    fromCart,
    setLastOrderId,
    subtotal,
    deliveryFee,
    discount,
    total,
    couponCode,
    calculationError,
    isCalculating,
  } = useCheckout();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const orderId = useRef(`GD-${crypto.randomUUID()}`);
  const { createShopOrder, user } = useAccount();
  const { clearCart } = useCart();

  const grouped = items.reduce<Record<string, typeof items>>((groups, item) => {
    const key = item.seller || "Local Seller";
    groups[key] = groups[key] ? [...groups[key], item] : [item];
    return groups;
  }, {});

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  async function placeOrder() {
    if (busy || isCalculating) return;

    if (calculationError) {
      setError(calculationError);
      const target = document.querySelector<HTMLElement>(".co-review-store, .co-form-card");
      scrollToElement(target, { focusField: true });
      return;
    }

    if (!form.fullName || !form.phone || !form.street || !form.district) {
      navigate("/checkout", {
        state: { error: "Please enter your complete delivery address and recipient details." },
      });
      return;
    }

    setBusy(true);
    setError("");

    const address = [
      form.street,
      form.area,
      form.landmark ? `Landmark: ${form.landmark}` : "",
      form.district,
      form.province,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      const orderPayload = {
        id: orderId.current,
        date: new Date().toISOString(),
        status: "Pending" as const,
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          weight: item.weight,
          seller: item.seller,
          origin: item.origin,
        })),
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod: paymentLabels[paymentMethod],
        paymentStatus: "Pending",
        deliveryAddress: address,
        recipientName: form.fullName || `${user.firstName} ${user.lastName}`.trim(),
        recipientPhone: form.phone,
        couponCode: couponCode || undefined,
        fromCart,
      };

      await createShopOrder(orderPayload);
      setLastOrderId(orderId.current);
      if (fromCart) {
        clearCart();
      }
      navigate("/checkout/confirmation", {
        state: { orderId: orderId.current, order: orderPayload },
      });
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : "Could not place order";
      const { targetSelector, userMessage } = mapBackendErrorToField(rawMsg);
      setError(userMessage);

      if (targetSelector) {
        setTimeout(() => {
          const el = document.querySelector<HTMLElement>(targetSelector);
          scrollToElement(el, { focusField: true });
        }, 50);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <CheckoutShell step={3}>
      <div className="checkout-layout">
        <div className="co-main">
          <h1>Review Your Order</h1>

          <section className="co-form-card">
            <div className="co-card-head">
              <h2>Products in Order</h2>
              <Link to="/cart">Edit</Link>
            </div>

            {Object.entries(grouped).map(([seller, sellerItems]) => (
              <div className="co-review-store" key={seller}>
                <p className="co-store-label">
                  Store: {seller}
                  {sellerItems[0]?.origin ? ` – ${sellerItems[0].origin}` : ""}
                </p>
                {sellerItems.map((item) => (
                  <div className="co-review-item" key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {formatQuantityWithUnit(
                          item.quantity,
                          resolveProductSellingUnit(item.category, item.sellingUnit, item.weight),
                          item.category
                        )}
                        {item.variant ? ` • Option: ${item.variant.name || item.variant}` : ""}
                      </small>
                    </div>
                    <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ))}
          </section>

          <section className="co-form-card">
            <div className="co-card-head">
              <h2>Delivery Address</h2>
              <Link to="/checkout">Edit</Link>
            </div>
            <p className="co-review-title">
              {form.addressType} Address ({form.district})
            </p>
            <p>
              {form.street}, {form.area}
              {form.landmark ? `, Landmark: ${form.landmark}` : ""}, {form.district},{" "}
              {form.province}
            </p>
            <p>
              <strong>Recipient Phone:</strong> {form.phone}
            </p>
          </section>

          <section className="co-form-card">
            <div className="co-card-head">
              <h2>Payment Method</h2>
              <Link to="/checkout/payment">Edit</Link>
            </div>
            <p className="co-review-title">{paymentLabels[paymentMethod]}</p>
            <p>
              {paymentMethod === "cod"
                ? `You will pay Rs. ${total.toLocaleString()} in local Nepalese rupees when our deliverer safely hands over the items.`
                : `You will complete ${paymentLabels[paymentMethod]} for Rs. ${total.toLocaleString()}.`}
            </p>
          </section>
        </div>

        <aside className="co-summary">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div className="co-summary-item" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div>
                <strong>{item.name}</strong>
                <small>
                  {formatQuantityWithUnit(
                    item.quantity,
                    resolveProductSellingUnit(item.category, item.sellingUnit, item.weight),
                    item.category
                  )}
                  {item.variant ? ` • Option: ${item.variant.name || item.variant}` : ""}
                  {item.seller ? ` • ${item.seller}` : ""}
                </small>
              </div>
              <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="co-summary-row">
            <span>Subtotal</span>
            <strong>Rs. {subtotal.toLocaleString()}</strong>
          </div>
          <div className="co-summary-row">
            <span>Delivery Fee</span>
            <strong>{deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}</strong>
          </div>
          {discount > 0 && (
            <div className="co-summary-row" style={{ color: "var(--brand, #2e7d32)" }}>
              <span>Promo Discount {couponCode ? `(${couponCode})` : ""}</span>
              <strong>-Rs. {discount.toLocaleString()}</strong>
            </div>
          )}
          <div className="co-summary-total">
            <span>Grand Total</span>
            <strong>Rs. {total.toLocaleString()}</strong>
          </div>
          {error && (
            <p className="auth-error" role="alert" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </p>
          )}
          <button type="button" className="co-continue" onClick={placeOrder} disabled={busy}>
            {busy ? "Placing order…" : "Place Order"}
            <span>→</span>
          </button>
        </aside>
      </div>
    </CheckoutShell>
  );
}

export default CheckoutReview;
