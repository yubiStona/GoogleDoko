import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Apple,
  Package,
  Plus,
  Star,
  Store,
  TriangleAlert,
  TrendingUp,
} from "lucide-react";

import { useAccount } from "../../context/AccountContext";
import { api } from "../../api/client";
import type { VendorDashboardData } from "../../api/client";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good Morning";
  }
  if (hour < 17) {
    return "Good Afternoon";
  }
  return "Good Evening";
}

function VendorHome() {
  const { user } = useAccount();
  const [data, setData] = useState<VendorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.vendorDashboard()
      .then((res) => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load vendor dashboard:", err);
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const vendorName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.vendor?.businessName ||
    "Vendor";

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statsData = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    averageRating: "No ratings yet",
    ratingCount: 0,
  };

  const stats = [
    {
      label: "Total Sales",
      value: `NPR ${Number(statsData.totalRevenue || 0).toLocaleString()}`,
      note: statsData.totalRevenue > 0 ? "Actual recorded revenue" : "No sales yet",
      tone: "green",
      icon: TrendingUp,
    },
    {
      label: "Total Orders",
      value: String(statsData.totalOrders || 0),
      note: statsData.totalOrders > 0 ? `${statsData.totalOrders} total orders received` : "No orders received yet",
      tone: "peach",
      icon: Package,
    },
    {
      label: "Pending Orders",
      value: String(statsData.pendingOrders || 0),
      note: statsData.pendingOrders > 0 ? "Requires fulfillment" : "All orders up to date",
      alert: statsData.pendingOrders > 0,
      tone: "cream",
      icon: Package,
    },
    {
      label: "Active Products",
      value: String(statsData.activeProducts || 0),
      note: statsData.activeProducts > 0 ? "Listed in marketplace" : "No active listings yet",
      tone: "blue",
      icon: Apple,
    },
    {
      label: "Low Stock Items",
      value: String(statsData.lowStockProducts || 0),
      note: statsData.lowStockProducts > 0 ? "Restock recommended (<=10)" : "Healthy inventory levels",
      alert: statsData.lowStockProducts > 0,
      tone: "pink",
      icon: TriangleAlert,
    },
    {
      label: "Average Rating",
      value: String(statsData.averageRating || "No ratings yet"),
      note:
        statsData.ratingCount > 0
          ? `Based on ${statsData.ratingCount} review${statsData.ratingCount > 1 ? "s" : ""}`
          : "No customer reviews yet",
      tone: "lilac",
      icon: Star,
    },
  ];

  // Calculate dynamic SVG coordinates for 7-day sales chart
  const chartDays = data?.chart || [];
  const maxRevenue = Math.max(...chartDays.map((d) => d.revenue), 100);
  const chartPoints = chartDays.map((d, index) => {
    const x = 24 + index * 54;
    // Map 0 -> y: 130, maxRevenue -> y: 36
    const ratio = d.revenue / maxRevenue;
    const y = Math.round(130 - ratio * 94);
    return { x, y, ...d };
  });

  const pointsStr =
    chartPoints.length > 0
      ? chartPoints.map((p) => `${p.x},${p.y}`).join(" ")
      : "24,130 348,130";
  const areaStr = `24,150 ${pointsStr} 348,150`;

  const bestsellers = data?.bestsellers || [];

  if (loading) {
    return (
      <div style={{ padding: 64, textAlign: "center", color: "#7a8c80" }}>
        Loading vendor dashboard...
      </div>
    );
  }

  return (
    <div className="vd-home">
      <div className="vd-welcome">
        <div>
          <h1>
            {greeting()}, {vendorName}! <span aria-hidden="true">👋</span>
          </h1>
          <p>Here is your Nepalese fresh market snapshot for today.</p>
        </div>
        <span className="vd-date">Today, {today}</span>
      </div>

      <section className="vd-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className={`vd-stat ${stat.tone}`} key={stat.label}>
              <header>
                <span>{stat.label}</span>
                <Icon size={16} />
              </header>
              <strong>
                {stat.value}
                {stat.label === "Average Rating" && stat.value !== "No ratings yet" ? " ★" : ""}
              </strong>
              <small className={stat.alert ? "alert" : ""}>{stat.note}</small>
            </article>
          );
        })}
      </section>

      <div className="vd-mid">
        <section className="vd-card vd-chart-card">
          <div className="vd-card-head">
            <h2>7-Day Sales Performance (NPR)</h2>
            <span>Last 7 Days</span>
          </div>

          {statsData.totalRevenue === 0 ? (
            <div
              style={{
                height: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#7a8c80",
                fontSize: 13,
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              <Package size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
              <p>No sales recorded in the past 7 days.</p>
              <small>Your daily revenue curve will appear here once customers purchase your produce.</small>
            </div>
          ) : (
            <svg className="vd-chart" viewBox="0 0 372 160" role="img" aria-label="Sales chart">
              <defs>
                <linearGradient id="vdFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#168d51" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#168d51" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <polygon points={areaStr} fill="url(#vdFill)" />
              <polyline
                points={pointsStr}
                fill="none"
                stroke="#168d51"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {chartPoints.map((point) => (
                <circle key={point.x} cx={point.x} cy={point.y} r="5" fill="#168d51">
                  <title>{`${point.label}: NPR ${point.revenue.toLocaleString()}`}</title>
                </circle>
              ))}
              {chartPoints.length > 0 ? (
                <>
                  <text x={chartPoints[0]?.x || 24} y="156" fontSize="11" fill="#7a8c80">
                    {chartPoints[0]?.label || ""}
                  </text>
                  {chartPoints[2] && (
                    <text x={chartPoints[2].x} y="156" fontSize="11" fill="#7a8c80">
                      {chartPoints[2].label}
                    </text>
                  )}
                  {chartPoints[4] && (
                    <text x={chartPoints[4].x} y="156" fontSize="11" fill="#7a8c80">
                      {chartPoints[4].label}
                    </text>
                  )}
                  <text x={chartPoints[chartPoints.length - 1]?.x - 20 || 318} y="156" fontSize="11" fill="#7a8c80">
                    Today
                  </text>
                </>
              ) : null}
            </svg>
          )}
        </section>

        <section className="vd-card vd-quick">
          <h2>Quick Access</h2>
          <div className="vd-quick-grid">
            <Link to="/vendor/products/new" className="mint">
              <Plus size={18} />
              Add Product
            </Link>
            <Link to="/vendor/orders" className="peach">
              <Package size={18} />
              Manage Orders
            </Link>
            <Link to="/vendor/reviews" className="blue">
              <Star size={18} />
              Read Reviews
            </Link>
            <Link to="/vendor/profile" className="lilac">
              <Store size={18} />
              Store Profile
            </Link>
          </div>
        </section>
      </div>

      <section className="vd-card vd-best">
        <div className="vd-card-head">
          <h2>Your Best Selling Products</h2>
          <Link to="/vendor/products">View Inventory</Link>
        </div>

        {bestsellers.length === 0 ? (
          <div
            style={{
              padding: "36px 16px",
              textAlign: "center",
              color: "#7a8c80",
              width: "100%",
            }}
          >
            <Package size={32} style={{ opacity: 0.35, marginBottom: 8 }} />
            <p style={{ fontWeight: 600, color: "#2d3b32", marginBottom: 4 }}>
              No product sales yet.
            </p>
            <p style={{ fontSize: 13, marginBottom: 16 }}>
              When customers buy your produce, your top-performing items will be ranked here.
            </p>
            <Link
              to="/vendor/products/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#168d51",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Plus size={16} /> Add Produce Listing
            </Link>
          </div>
        ) : (
          <div className="vd-best-grid">
            {bestsellers.map((item) => (
              <article key={item.id || item.name}>
                <img src={item.image} alt={item.name} />
                <strong>
                  {item.name}
                  {item.place ? ` (${item.place})` : ""}
                </strong>
                <span>{item.sold}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default VendorHome;
