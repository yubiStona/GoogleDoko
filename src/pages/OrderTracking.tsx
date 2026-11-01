import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { Check, ArrowLeft, ShoppingBag, Eye, HelpCircle } from "lucide-react";

import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SupportModal from "../components/SupportModal";
import { useOrders } from "../context/OrdersContext";
import { useAccount } from "../context/AccountContext";
import { normalizeOrder, type NormalizedOrder } from "../utils/normalizeOrder";
import { api, getToken } from "../api/client";

const trackSteps = [
  "Order Placed",
  "Order Confirmed",
  "Preparing",
  "Ready for Pickup",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

function currentTrackIndex(status: string) {
  if (status === "Delivered") return 6;
  if (status === "Shipped") return 4;
  if (status === "Processing" || status === "Pending") return 2;
  return 1;
}

function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders } = useOrders();
  const { orders: accountOrders } = useAccount();
  const [supportOpen, setSupportOpen] = useState(false);

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
        <main className="checkout-page">
          <div className="checkout-wrap">
            {searching ? (
              <>
                <h1>Looking up order #{activeId}...</h1>
                <p>If this order was recently placed, you can also view it in your orders list.</p>
              </>
            ) : (
              <>
                <h1>Order #{activeId} not found</h1>
                <p>We could not locate this order in your order history.</p>
              </>
            )}
            <div style={{ display: "flex", gap: "12px", marginTop: "1rem" }}>
              <Link to={`/orders/${activeId}`} className="co-continue" style={{ textDecoration: "none" }}>
                Open Order Details
              </Link>
              <Link to="/orders" className="co-ghost" style={{ textDecoration: "none" }}>
                View All Orders
              </Link>
              <button
                type="button"
                className="co-shop-link"
                style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 600, color: "var(--brand-primary, #0c831f)" }}
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

  const active = currentTrackIndex(order.status);
  const products = order.products || [];

  const vendors = products.reduce<
    { seller: string; names: string; status: string }[]
  >((list, item, index) => {
    const seller = item.seller || "Local Farm Seller";
    const existing = list.find((entry) => entry.seller === seller);
    const status =
      order.status === "Delivered"
        ? "Delivered"
        : order.status === "Shipped" && index === 0
          ? "Shipped"
          : "Preparing";

    if (existing) {
      existing.names += `, ${item.name} (${item.quantity})`;
      return list;
    }

    list.push({
      seller,
      names: `${item.name} (${item.quantity} ${item.unit ?? ""})`.trim(),
      status,
    });
    return list;
  }, []);

  return (
    <>
      <TopBar />
      <Navbar />

      <main className="checkout-page">
        <div className="checkout-wrap">
          <div style={{ marginBottom: "1rem" }}>
            <Link to="/orders" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-muted, #666)", textDecoration: "none", fontWeight: 500 }}>
              <ArrowLeft size={16} /> Back to My Orders
            </Link>
          </div>

          <div className="track-head">
            <div>
              <h1>Order Tracking</h1>
              <p>
                Order ID: <strong>{order.id}</strong> · Placed on {order.date}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="co-ghost"
                onClick={() => setSupportOpen(true)}
              >
                <HelpCircle size={16} style={{ marginRight: "6px" }} />
                Contact Support
              </button>
              <button
                type="button"
                className="co-continue"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <Eye size={16} style={{ marginRight: "6px" }} />
                Open Order Details
              </button>
            </div>
          </div>

          <div className="track-layout">
            <section className="co-form-card">
              <h2>Shipment Progress</h2>
              <ol className="track-timeline">
                {trackSteps.map((step, index) => {
                  const complete = index < active;
                  const current = index === active;

                  return (
                    <li
                      key={step}
                      className={`${complete ? "complete" : ""} ${current ? "current" : ""}`}
                    >
                      <span className="track-dot">
                        {complete || current ? <Check size={12} /> : null}
                      </span>
                      <div>
                        <strong>{step}</strong>
                        <small>
                          {complete
                            ? order.date
                            : current
                              ? "In Progress"
                              : "Upcoming"}
                        </small>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <aside className="track-side">
              <section className="co-form-card">
                <h2>Vendor Package Breakdown</h2>
                {vendors.length > 0 ? (
                  vendors.map((vendor) => (
                    <div className="track-vendor" key={vendor.seller}>
                      <div>
                        <strong>{vendor.seller}</strong>
                        <small>{vendor.names}</small>
                      </div>
                      <span className={`track-pill ${vendor.status.toLowerCase()}`}>
                        {vendor.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--color-muted, #777)", fontSize: "0.9rem" }}>Standard delivery package</p>
                )}
              </section>

              <section className="co-form-card">
                <h2>Delivery Address</h2>
                <strong>
                  {order.recipientName || "Valued Customer"}
                </strong>
                <p>{order.deliveryAddress || "Kathmandu, Nepal"}</p>
                {order.recipientPhone && <p>Contact: {order.recipientPhone}</p>}
                
                <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    type="button"
                    className="co-continue"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <Eye size={16} style={{ marginRight: "6px" }} />
                    Open Order Details
                  </button>

                  <button
                    type="button"
                    className="co-ghost"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => navigate("/shop")}
                  >
                    <ShoppingBag size={16} style={{ marginRight: "6px" }} />
                    Continue Shopping
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
      <Footer />
    </>
  );
}

export default OrderTracking;
