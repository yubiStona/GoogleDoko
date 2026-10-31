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

const stats = [
  {
    label: "Total Sales",
    value: "Rs. 256,780",
    note: "↑ 15% vs last week",
    tone: "green",
    icon: TrendingUp,
  },
  {
    label: "Total Orders",
    value: "124",
    note: "↑ 8% vs yesterday",
    tone: "peach",
    icon: Package,
  },
  {
    label: "Pending Orders",
    value: "8",
    note: "Needs attention",
    alert: true,
    tone: "cream",
    icon: Package,
  },
  {
    label: "Active Products",
    value: "45",
    note: "Healthy stock",
    tone: "blue",
    icon: Apple,
  },
  {
    label: "Low Stock Items",
    value: "3",
    note: "Action required",
    tone: "pink",
    icon: TriangleAlert,
  },
  {
    label: "Average Rating",
    value: "4.8",
    note: "Based on 82 reviews",
    tone: "lilac",
    icon: Star,
  },
];

const chart = [
  { x: 24, y: 118 },
  { x: 78, y: 102 },
  { x: 132, y: 88 },
  { x: 186, y: 94 },
  { x: 240, y: 62 },
  { x: 294, y: 70 },
  { x: 348, y: 36 },
];

const bestsellers = [
  {
    name: "Red Apples",
    place: "Mustang",
    sold: "1,245 kg sold",
    image: "/src/frontend/assets/images/products/apple.jpg",
  },
  {
    name: "Fresh Tomatoes",
    place: "",
    sold: "982 kg sold",
    image: "/src/frontend/assets/images/products/tomato.jpg",
  },
  {
    name: "Local Potatoes",
    place: "",
    sold: "876 kg sold",
    image: "/src/frontend/assets/images/products/potato.jpg",
  },
  {
    name: "Organic Spinach",
    place: "",
    sold: "642 bundles sold",
    image: "/src/frontend/assets/images/products/spinach.jpg",
  },
  {
    name: "Mountain Honey",
    place: "",
    sold: "521 kg sold",
    image: "/src/frontend/assets/images/products/honey.jpg",
  },
];

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
  const vendorName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.vendor?.businessName ||
    "Vendor";
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const points = chart.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `24,150 ${points} 348,150`;

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
                {stat.label === "Average Rating" ? " ★" : ""}
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
            <span>Last 7 Days ▾</span>
          </div>
          <svg className="vd-chart" viewBox="0 0 372 160" role="img" aria-label="Sales chart">
            <defs>
              <linearGradient id="vdFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#168d51" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#168d51" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <polygon points={area} fill="url(#vdFill)" />
            <polyline
              points={points}
              fill="none"
              stroke="#168d51"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {chart.map((point) => (
              <circle key={point.x} cx={point.x} cy={point.y} r="5" fill="#168d51" />
            ))}
            <text x="24" y="156" fontSize="11" fill="#7a8c80">
              Aug 24
            </text>
            <text x="132" y="156" fontSize="11" fill="#7a8c80">
              Aug 26
            </text>
            <text x="240" y="156" fontSize="11" fill="#7a8c80">
              Aug 28
            </text>
            <text x="318" y="156" fontSize="11" fill="#7a8c80">
              Today
            </text>
          </svg>
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
        <div className="vd-best-grid">
          {bestsellers.map((item) => (
            <article key={item.name}>
              <img src={item.image} alt="" />
              <strong>
                {item.name}
                {item.place ? ` (${item.place})` : ""}
              </strong>
              <span>{item.sold}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default VendorHome;
