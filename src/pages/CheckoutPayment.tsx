import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Check, Smartphone, Wallet, AlertCircle } from "lucide-react";

import CheckoutShell from "../components/CheckoutShell";
import OrderSummaryCard from "../components/OrderSummaryCard";
import {
  useCheckout,
  type PaymentMethod,
} from "../context/CheckoutContext";
import { scrollToElement } from "../utils/formErrorNavigation";

const methods: {
  id: PaymentMethod;
  title: string;
  text: string;
  icon: typeof Wallet;
}[] = [
  {
    id: "esewa",
    title: "eSewa Mobile Wallet",
    text: "Pay instantly via your eSewa Nepalese digital wallet.",
    icon: Wallet,
  },
  {
    id: "khalti",
    title: "Khalti Wallet",
    text: "Quick mobile payment utilizing Khalti digital system.",
    icon: Smartphone,
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    text: "Pay with local currency when the delivery partner reaches your door.",
    icon: Wallet,
  },
  {
    id: "bank",
    title: "Direct Bank Transfer",
    text: "Transfer directly using mobile banking / ConnectIPS.",
    icon: Building2,
  },
];

function CheckoutPayment() {
  const navigate = useNavigate();
  const { items, paymentMethod, setPaymentMethod } = useCheckout();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  function handleProceedToReview() {
    if (!paymentMethod || !methods.some((m) => m.id === paymentMethod)) {
      setPaymentError("Please select a payment method to continue.");
      const payList = document.querySelector<HTMLElement>(".co-pay-list");
      scrollToElement(payList, { focusField: true });
      return;
    }

    setPaymentError(null);
    navigate("/checkout/review");
  }

  function handleSelectMethod(id: PaymentMethod) {
    setPaymentError(null);
    setPaymentMethod(id);
  }

  return (
    <CheckoutShell step={2}>
      <div className="checkout-layout">
        <div className="co-main">
          <h1>Select Payment Method</h1>

          {paymentError && (
            <div className="co-group-error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{paymentError}</span>
            </div>
          )}

          <div
            className={`co-pay-list ${paymentError ? "has-error" : ""}`}
            aria-invalid={Boolean(paymentError)}
            role="radiogroup"
            aria-label="Payment Methods"
          >
            {methods.map((method) => {
              const Icon = method.icon;
              const selected = paymentMethod === method.id;

              return (
                <button
                  type="button"
                  key={method.id}
                  className={`co-pay-card ${selected ? "selected" : ""}`}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => handleSelectMethod(method.id)}
                >
                  <span className="co-pay-icon">
                    <Icon size={18} />
                  </span>
                  <span>
                    <strong>{method.title}</strong>
                    <small>{method.text}</small>
                  </span>
                  <span className="co-pay-radio">
                    {selected && <Check size={14} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <OrderSummaryCard
          items={items}
          actionLabel="Review Order"
          onAction={handleProceedToReview}
        />
      </div>
    </CheckoutShell>
  );
}

export default CheckoutPayment;
