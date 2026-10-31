import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  Download,
  MapPin,
  RotateCcw,
  Truck,
  UserRound,
  ShoppingBag,
} from "lucide-react";

import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import { products } from "../data/products";
import { useOrders } from "../context/OrdersContext";
import { useAccount } from "../context/AccountContext";
import { useCart } from "../context/CartContext";
import { normalizeOrder, type NormalizedOrder } from "../utils/normalizeOrder";
import { api, getToken } from "../api/client";

const trackerSteps = [
  "Ordered",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
] as const;

function statusIndex(status: string) {
  if (status === "Delivered") return 4;
  if (status === "Shipped") return 3;
  if (status === "Processing" || status === "Pending") return 2;
  return 0;
}

function dateOnly(value: string) {
  return (value || "").split(",")[0].trim();
}

function addDaysLabel(value: string, days: number) {
  const parsed = new Date(dateOnly(value));

  if (Number.isNaN(parsed.getTime())) {
    return dateOnly(value);
  }

  parsed.setDate(parsed.getDate() + days);

  return parsed.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function enrichItem(item: any) {
  const catalog = products.find(
    (product) => product.name === item.name || product.id === item.productId
  );

  return {
    ...item,
    origin: item.origin ?? catalog?.origin ?? "Nepal",
    seller: item.seller ?? catalog?.seller ?? "Local Seller",
    unit: item.unit ?? item.weight ?? catalog?.weight ?? "1 kg",
    image: item.image || catalog?.image || "/src/frontend/assets/images/products/apple.jpg",
    productId: item.productId || catalog?.id,
  };
}

function trackerDates(order: NormalizedOrder) {
  const ordered = dateOnly(order.date);

  return {
    Ordered: ordered,
    Confirmed: ordered,
    Processing: ordered,
    Shipped:
      order.status === "Shipped" || order.status === "Delivered"
        ? addDaysLabel(order.date, 1)
        : "",
    Delivered: order.status === "Delivered" ? order.deliveryDate : "",
  };
}

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders } = useOrders();
  const { orders: accountOrders } = useAccount();
  const { addToCart } = useCart();

  const localOrder =
    location.state?.order ||
    orders.find((item) => item.id === id) ||
    accountOrders.find((item) => item.id === id);

  const [order, setOrder] = useState<NormalizedOrder | null>(
    localOrder ? normalizeOrder(localOrder) : null
  );
  const [searching, setSearching] = useState(!localOrder);

  useEffect(() => {
    if (!order && id && getToken()) {
      setSearching(true);
      api.getOrderById(id)
        .then((res) => {
          if (res) setOrder(normalizeOrder(res));
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    } else if (!order) {
      setSearching(false);
    }
  }, [order, id]);

  const activeId = order?.id || id || "GD-ORD";

  if (!order) {
    return (
      <>
        <TopBar />
        <Navbar />
        <main className="order-detail-page">
          <div className="order-detail-missing">
            {searching ? (
              <>
                <h1>Looking up order #{activeId}...</h1>
                <p>If you just placed this order, it will appear here shortly.</p>
              </>
            ) : (
              <>
                <h1>Order #{activeId} not found</h1>
                <p>We could not find this order in your account or order history.</p>
              </>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "1rem" }}>
              <Link to="/orders" className="od-action-primary" style={{ textDecoration: "none" }}>
                Back to orders
              </Link>
              <button
                type="button"
                className="od-action-secondary"
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const items = (order.products || []).map(enrichItem);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = order.deliveryFee ?? 50;
  const rawTotal = subtotal + deliveryFee;
  const discount = Math.max(0, rawTotal - order.total);
  const total = order.total;
  const currentStep = statusIndex(order.status);
  const dates = trackerDates(order);
  const paid = order.status === "Delivered" || order.paymentStatus === "Paid";

  function reorder() {
    items.forEach((item) => {
      const catalog = products.find(
        (product) => product.name === item.name || product.id === item.productId
      );

      if (catalog) {
        addToCart(catalog, item.quantity);
      } else {
        addToCart(
          {
            id: item.productId || `P-${item.name}`,
            name: item.name,
            category: "Organic Produce",
            price: item.price,
            weight: item.unit || "1 kg",
            image: item.image,
            rating: 4.8,
            sold: "100+",
            origin: item.origin || "Nepal",
            seller: item.seller || "Local Seller",
            gallery: [item.image],
          },
          item.quantity
        );
      }
    });

    navigate("/cart");
  }

  function downloadInvoice() {
    if (!order) return;
    const lines = [
      "GoogleDoko Invoice",
      `Order #${order.id}`,
      `Placed on ${order.date}`,
      `Status: ${order.status}`,
      "",
      "Items:",
      ...items.map(
        (item) =>
          `- ${item.name} (${item.origin}) x${item.quantity} @ Rs ${item.price} = Rs ${item.price * item.quantity}`,
      ),
      "",
      `Subtotal: Rs ${subtotal}`,
      `Delivery Fee: Rs ${deliveryFee}`,
      `Discount: Rs ${discount}`,
      `Total: Rs ${total}`,
      "",
      `Payment Method: ${order.paymentMethod}`,
      `Payment Status: ${paid ? "Paid" : "Pending"}`,
      "Delivery: Standard Delivery",
      `Recipient: ${order.recipientName}`,
      `Address: ${order.deliveryAddress}`,
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GoogleDoko-Invoice-${order.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <TopBar />
      <Navbar />

      <main className="order-detail-page">
        <div className="order-detail-wrap">
          <nav className="product-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/orders">Orders</Link>
            <span>/</span>
            <strong>Order #{order.id}</strong>
          </nav>

          <section className="od-header">
            <Link to="/orders" className="od-back">
              <ArrowLeft size={18} />
              Back to Orders
            </Link>

            <div className="od-header-row">
              <div>
                <h1>Order #{order.id}</h1>
                <p>
                  <CalendarDays size={16} />
                  Placed on {order.date}
                </p>
              </div>

              <span className={`order-status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
          </section>

          <section className="od-card od-tracker">
            <div className="od-tracker-row">
              {trackerSteps.map((step, index) => {
                const complete = currentStep >= index && order.status !== "Cancelled";
                const current =
                  currentStep === index &&
                  order.status !== "Cancelled" &&
                  order.status !== "Delivered";

                return (
                  <div
                    className={`od-step ${complete ? "complete" : ""} ${current ? "current" : ""}`}
                    key={step}
                  >
                    {index > 0 && <span className="od-step-line" />}
                    <span className="od-step-dot">
                      {complete ? <Check size={14} /> : index + 1}
                    </span>
                    <strong>{step}</strong>
                    <small>
                      {dates[step] || (complete ? dateOnly(order.date) : "Pending")}
                    </small>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="od-layout">
            <div className="od-card od-items">
              <h2>Ordered Items</h2>

              {items.map((item) => (
                <article className="od-item" key={`${item.name}-${item.origin}-${item.productId}`}>
                  <img src={item.image} alt={item.name} />

                  <div className="od-item-info">
                    <h3>{item.name}</h3>
                    <p>
                      <MapPin size={14} />
                      Origin: {item.origin}
                    </p>
                    <p>
                      <UserRound size={14} />
                      Seller: {item.seller}
                    </p>
                    <span>
                      {item.quantity} × Rs. {item.price}/{item.unit.replace(/^\d+\s*/, "") || "kg"}
                    </span>
                  </div>

                  <div className="od-item-total">
                    <small>Subtotal</small>
                    <strong>Rs. {(item.price * item.quantity).toLocaleString()}</strong>
                  </div>
                </article>
              ))}
            </div>

            <aside className="od-sidebar">
              <section className="od-card">
                <h2>Delivery Information</h2>

                <div className="od-info-row">
                  <MapPin size={20} />
                  <div>
                    <span>Delivery address</span>
                    <strong>{order.recipientName || "Valued Customer"}</strong>
                    <p>{order.deliveryAddress || "Kathmandu, Nepal"}</p>
                    {order.recipientPhone && <small>Contact: {order.recipientPhone}</small>}
                  </div>
                </div>

                <div className="od-info-row">
                  <CalendarDays size={20} />
                  <div>
                    <span>Delivery date</span>
                    <strong>{order.deliveryDate}</strong>
                  </div>
                </div>

                <div className="od-info-row">
                  <Truck size={20} />
                  <div>
                    <span>Delivery method</span>
                    <strong>Standard Delivery</strong>
                  </div>
                </div>
              </section>

              <section className="price-details od-card od-price">
                <h2>Price Details</h2>

                <div className="price-row">
                  <span>Subtotal</span>
                  <strong>Rs. {subtotal.toLocaleString()}</strong>
                </div>

                <div className="price-row">
                  <span>Delivery Fee</span>
                  <strong>Rs. {deliveryFee}</strong>
                </div>

                <div className="price-row">
                  <span>Discount</span>
                  <strong>Rs. {discount}</strong>
                </div>

                <div className="price-divider" />

                <div className="total-row">
                  <span>Total</span>
                  <strong>Rs. {total.toLocaleString()}</strong>
                </div>
              </section>

              <section className="od-card od-payment">
                <h2>Payment Information</h2>

                <div className="od-info-row">
                  <Banknote size={20} />
                  <div>
                    <span>Payment Method</span>
                    <strong>{order.paymentMethod}</strong>
                  </div>
                </div>

                <div className="od-info-row">
                  <Check size={20} />
                  <div>
                    <span>Payment Status</span>
                    <strong className={paid ? "paid" : "pending"}>
                      {paid ? "Paid" : "Pending"}
                    </strong>
                  </div>
                </div>
              </section>
            </aside>
          </section>

          <div className="od-actions">
            <Link to={`/orders/${order.id}/track`} className="od-action-primary" style={{ textDecoration: "none" }}>
              <Truck size={18} />
              Track Order
            </Link>
            <button type="button" className="od-action-secondary" onClick={downloadInvoice}>
              <Download size={18} />
              Download Invoice
            </button>
            <button type="button" className="od-action-primary" onClick={reorder}>
              <RotateCcw size={18} />
              Reorder
            </button>
            <button
              type="button"
              className="od-action-secondary"
              onClick={() => navigate("/shop")}
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default OrderDetail;
