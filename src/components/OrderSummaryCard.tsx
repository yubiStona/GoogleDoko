import type { CartItem } from "../context/CartContext";
import { useCheckout } from "../context/CheckoutContext";
import PromoCodeSection from "./checkout/PromoCodeSection";

interface OrderSummaryCardProps {
  items: CartItem[];
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}

function OrderSummaryCard({
  items,
  actionLabel,
  onAction,
  disabled,
}: OrderSummaryCardProps) {
  const {
    subtotal: serverSubtotal,
    deliveryFee: serverDeliveryFee,
    discount: serverDiscount,
    total: serverTotal,
    couponCode,
    isCalculating,
    calculationError,
  } = useCheckout();

  // If server calculated figures exist, prefer them; otherwise fallback to items calculation
  const safeItems = items || [];
  const subtotal = serverSubtotal > 0 ? serverSubtotal : safeItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = serverDeliveryFee;
  const discount = serverDiscount;
  const total = serverTotal > 0 ? serverTotal : Math.max(0, subtotal + deliveryFee - discount);

  return (
    <aside className="co-summary">
      <h2>Order Summary</h2>

      <div className="co-summary-items">
        {safeItems.map((item) => (
          <div className="co-summary-item" key={item.id}>
            <img src={item.image} alt={item.name} />
            <div>
              <strong>{item.name}</strong>
              <small>
                {item.quantity} {item.weight.replace(/^\d+\s*/, "") || "kg"}
                {item.seller ? ` • ${item.seller}` : ""}
              </small>
            </div>
            <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="co-summary-row">
        <span>Subtotal</span>
        <strong>Rs. {subtotal.toLocaleString()}</strong>
      </div>

      <div className="co-summary-row">
        <span>Delivery Fee</span>
        <strong>{deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}</strong>
      </div>

      <div className="co-summary-promo-wrap" style={{ margin: "14px 0", borderTop: "1px dashed #e2e8f0", borderBottom: "1px dashed #e2e8f0", padding: "12px 0" }}>
        <PromoCodeSection />
      </div>

      {discount > 0 && (
        <div className="co-summary-row discount-row" style={{ color: "var(--brand, #2e7d32)" }}>
          <span>Promo Discount {couponCode ? `(${couponCode})` : ""}</span>
          <strong>-Rs. {discount.toLocaleString()}</strong>
        </div>
      )}

      <div className="co-summary-total">
        <span>Grand Total</span>
        <strong>Rs. {total.toLocaleString()}</strong>
      </div>

      {calculationError && (
        <p className="co-calc-error" style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "8px" }}>
          ⚠️ {calculationError}
        </p>
      )}

      <button
        type="button"
        className="co-continue"
        onClick={onAction}
        disabled={disabled || items.length === 0 || isCalculating || Boolean(calculationError)}
      >
        {isCalculating ? "Calculating..." : actionLabel}
        <span>→</span>
      </button>
    </aside>
  );
}

export default OrderSummaryCard;
