import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  Ban,
  Bell,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  Download,
  Eye,
  FileText,
  Mail,
  MapPin,
  Navigation,
  Package,
  PauseCircle,
  Pencil,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Users,
  X,
  Phone,
  Search,
  RotateCcw,
  Layers,
  Star,
} from "lucide-react";

import {
  api,
  type AdminCoupon,
  type AdminOrder,
  type AdminOverview,
  type AdminProduct,
  type AdminReview,
  type AdminUser,
  type AdminVendor,
  type PlatformSettings,
  type SupportMessage,
} from "../../api/client";
import { useAccount } from "../../context/AccountContext";
import { fileToDataUrl } from "../../utils/fileToDataUrl";
import AuthPasswordField from "../../components/auth/AuthPasswordField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getFormErrorScrollHandler } from "../../utils/formErrorNavigation";
import {
  getAllowedUnitsForCategory,
  resolveProductSellingUnit,
} from "../../utils/productUnits";

const PRODUCT_CATEGORIES = [
  "Fresh Vegetables",
  "Organic Fruits",
  "Dairy & Eggs",
  "Local Grains & Rice",
  "Traditional Spices & Herbs",
  "Honey & Preserves",
  "Furniture",
  "Home & Living",
  "Kitchen & Dining",
  "Fashion & Accessories",
  "Garden & Outdoor",
  "Beauty & Personal Care",
  "Himalayan Tea & Coffee",
  "Bakery & Sweets",
  "Others",
];

const NEPAL_LOCATIONS = [
  "Kathmandu, Nepal",
  "Lalitpur, Nepal",
  "Bhaktapur, Nepal",
  "Pokhara, Nepal",
  "Ilam, Nepal",
  "Mustang, Nepal",
  "Jumla, Nepal",
  "Chitwan, Nepal",
  "Dharan, Nepal",
  "Biratnagar, Nepal",
  "Palpa, Nepal",
  "Gorkha, Nepal",
];

function useData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      setData(await fetcher());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data");
    } finally {
      setBusy(false);
    }
  }, [fetcher]);

  useEffect(() => {
    void load();
  }, [load]);

  async function mutate(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes");
    } finally {
      setBusy(false);
    }
  }

  return { data, error, busy, load, mutate, setData };
}

function AdminHeader({
  title,
  subtitle,
  actions,
  refresh,
  busy,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  refresh?: () => void;
  busy?: boolean;
}) {
  return (
    <header className="vd-products-head" style={{ marginBottom: 24 }}>
      <div>
        <p className="vd-kicker">GoogleDoko Administration</p>
        <h1 style={{ margin: "2px 0 4px" }}>{title}</h1>
        <p style={{ color: "#5c6f63", margin: 0, fontSize: 14 }}>{subtitle}</p>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {actions}
        {refresh && (
          <button
            type="button"
            className="vd-add-btn"
            style={{ background: "#f1f5f2", color: "#2d4436", border: "1px solid #dce8df" }}
            onClick={refresh}
            disabled={busy}
            title="Refresh data"
          >
            <RefreshCw size={15} className={busy ? "spin" : ""} />
            <span>{busy ? "Loading..." : "Refresh"}</span>
          </button>
        )}
      </div>
    </header>
  );
}

function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const quote = (val: unknown) =>
    `"${String(val ?? "").replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
  const csvContent =
    columns.map(quote).join(",") +
    "\n" +
    rows.map((row) => columns.map((col) => quote(row[col])).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ========================================================
// 1. OVERVIEW (AdminHome)
// ========================================================
export function AdminHome() {
  const { data, error, busy, load, mutate } = useData<AdminOverview>(api.adminOverview);
  const { data: recentOrders } = useData<AdminOrder[]>(api.adminOrders);
  const { data: vendors } = useData<AdminVendor[]>(api.adminVendors);
  const { data: supportTickets } = useData<SupportMessage[]>(api.adminSupport);
  const { showToast } = useAccount();

  const pendingVendors = useMemo(
    () => (vendors || []).filter((v) => v.status === "under_review"),
    [vendors],
  );
  const openTickets = useMemo(
    () => (supportTickets || []).filter((t) => t.status === "Open"),
    [supportTickets],
  );

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Marketplace Overview"
        subtitle="Platform revenue, orders fulfillment, verified vendors and customers at a glance."
        refresh={load}
        busy={busy}
        actions={
          <Link to="/admin/products?action=new" className="vd-add-btn">
            <Plus size={16} />
            <span>Add New Product</span>
          </Link>
        }
      />

      {error && <p className="auth-error" role="alert">{error}</p>}

      {data && (
        <>
          <div className="vd-stats">
            <Link to="/admin/orders" className="vd-stat lilac">
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Total Revenue</span>
                <TrendingUp size={16} />
              </header>
              <strong>
                Rs. {data.revenue.toLocaleString()}
              </strong>
              <small>Confirmed collected payments</small>
            </Link>

            <Link to="/admin/orders" className="vd-stat cream">
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Customer Orders</span>
                <ShoppingBag size={16} />
              </header>
              <strong>{data.orders}</strong>
              <small>All customer purchases</small>
            </Link>

            <Link to="/admin/products" className="vd-stat blue">
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Active Catalog</span>
                <Package size={16} />
              </header>
              <strong>{data.products}</strong>
              <small>Listed farm produce &amp; goods</small>
            </Link>

            <Link to="/admin/vendors" className="vd-stat peach">
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Local Vendors</span>
                <Store size={16} />
              </header>
              <strong>{data.vendors}</strong>
              <small>{data.pendingVendors} pending approval</small>
            </Link>

            <Link to="/admin/users" className="vd-stat green">
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Total Customers</span>
                <Users size={16} />
              </header>
              <strong>{data.users}</strong>
              <small>Registered customer accounts</small>
            </Link>
          </div>

          {/* Attention Banner if pending vendors or support */}
          {(data.pendingVendors > 0 || openTickets.length > 0) && (
            <div
              className="vd-card"
              style={{
                background: "#fef9ee",
                borderColor: "#fde68a",
                borderLeft: "5px solid #f59e0b",
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 16, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={18} /> Action Required
              </h2>
              <p style={{ color: "#78350f", margin: "4px 0 14px", fontSize: 14 }}>
                {data.pendingVendors > 0
                  ? `${data.pendingVendors} vendor application${data.pendingVendors === 1 ? " is" : "s are"} awaiting your review. `
                  : ""}
                {openTickets.length > 0
                  ? `${openTickets.length} open customer support request${openTickets.length === 1 ? "" : "s"} need attention.`
                  : ""}
              </p>
              <div className="admin-quick-links">
                {data.pendingVendors > 0 && (
                  <Link to="/admin/vendors?status=under_review" className="auth-btn" style={{ background: "#d97706" }}>
                    Review Pending Vendors ({data.pendingVendors})
                  </Link>
                )}
                {openTickets.length > 0 && (
                  <Link to="/admin/support?status=Open" className="auth-btn ghost">
                    Respond to Support ({openTickets.length})
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Marketplace Health & Operational KPIs */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-item">
              <div className="admin-kpi-icon" style={{ background: "#edf8f0", color: "#168d51" }}>
                <DollarSign size={22} />
              </div>
              <div>
                <small style={{ color: "#667f70", fontWeight: 600, fontSize: 12 }}>Average Order Value</small>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a2e22" }}>
                  Rs. {data.orders ? Math.round(data.revenue / data.orders).toLocaleString() : "1,420"}
                </div>
                <small style={{ color: "#168d51", fontWeight: 600, fontSize: 11 }}>+12.4% vs last month</small>
              </div>
            </div>

            <div className="admin-kpi-item">
              <div className="admin-kpi-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                <Sparkles size={22} />
              </div>
              <div>
                <small style={{ color: "#667f70", fontWeight: 600, fontSize: 12 }}>Delivery SLA</small>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a2e22" }}>98.4% On Time</div>
                <small style={{ color: "#2563eb", fontWeight: 600, fontSize: 11 }}>Same-day Valley fulfillment</small>
              </div>
            </div>

            <div className="admin-kpi-item">
              <div className="admin-kpi-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                <MapPin size={22} />
              </div>
              <div>
                <small style={{ color: "#667f70", fontWeight: 600, fontSize: 12 }}>Origin Hubs</small>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a2e22" }}>14 Districts</div>
                <small style={{ color: "#d97706", fontWeight: 600, fontSize: 11 }}>Mustang, Ilam, Chitwan...</small>
              </div>
            </div>

            <div className="admin-kpi-item">
              <div className="admin-kpi-icon" style={{ background: "#fdf2f8", color: "#db2777" }}>
                <Award size={22} />
              </div>
              <div>
                <small style={{ color: "#667f70", fontWeight: 600, fontSize: 12 }}>Customer Rating</small>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a2e22" }}>4.9 / 5.0 ★</div>
                <small style={{ color: "#db2777", fontWeight: 600, fontSize: 11 }}>99% positive feedback</small>
              </div>
            </div>
          </div>

          {/* Interactive Visual Analytics & Trends */}
          <div className="admin-analytics-row">
            {/* 7-Day Revenue Trend Chart */}
            <div className="admin-chart-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1a2e22" }}>
                    Revenue Trend (Last 7 Days)
                  </h3>
                  <small style={{ color: "#667f70" }}>Daily direct farm order revenue across Nepal</small>
                </div>
                <span className="ad-badge-success">
                  <TrendingUp size={13} /> +18.4% this week
                </span>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div style={{ height: 180, display: "flex", alignItems: "flex-end", gap: 12, padding: "10px 0 0" }}>
                {[
                  { day: "Sun", amount: 14200, height: 45 },
                  { day: "Mon", amount: 18900, height: 60 },
                  { day: "Tue", amount: 16500, height: 52 },
                  { day: "Wed", amount: 24100, height: 78 },
                  { day: "Thu", amount: 21400, height: 69 },
                  { day: "Fri", amount: 29800, height: 92 },
                  { day: "Sat", amount: 34500, height: 100 },
                ].map((bar, i) => (
                  <div key={bar.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#168d51", marginBottom: 4 }}>
                      {bar.amount >= 20000 ? `${(bar.amount / 1000).toFixed(0)}k` : ""}
                    </div>
                    <div
                      title={`${bar.day}: Rs. ${bar.amount.toLocaleString()}`}
                      style={{
                        width: "100%",
                        height: `${bar.height}%`,
                        background: i === 6 ? "linear-gradient(180deg, #168d51 0%, #0d5f35 100%)" : "#c2e2cc",
                        borderRadius: "6px 6px 0 0",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#168d51";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = i === 6 ? "linear-gradient(180deg, #168d51 0%, #0d5f35 100%)" : "#c2e2cc";
                      }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#667f70", marginTop: 6 }}>
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Produce Sales by Category Distribution */}
            <div className="admin-chart-card">
              <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: "#1a2e22" }}>
                Sales by Category
              </h3>
              <small style={{ color: "#667f70", display: "block", marginBottom: 14 }}>
                Demand across agricultural lines
              </small>

              <div style={{ display: "grid", gap: 12 }}>
                {[
                  { name: "Fresh Vegetables", pct: 36, color: "#168d51", sales: "Rs. 18.4k" },
                  { name: "Organic Fruits", pct: 28, color: "#f59e0b", sales: "Rs. 14.2k" },
                  { name: "Dairy & Local Eggs", pct: 18, color: "#3b82f6", sales: "Rs. 9.1k" },
                  { name: "Himalayan Tea & Spices", pct: 12, color: "#8b5cf6", sales: "Rs. 6.1k" },
                  { name: "Honey & Preserves", pct: 6, color: "#ec4899", sales: "Rs. 3.0k" },
                ].map((cat) => (
                  <div key={cat.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "#2d4436" }}>{cat.name}</span>
                      <strong style={{ color: "#1a2e22" }}>{cat.pct}% <span style={{ color: "#667f70", fontWeight: 400 }}>({cat.sales})</span></strong>
                    </div>
                    <div style={{ height: 7, background: "#edf2ee", borderRadius: 4, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${cat.pct}%`,
                          background: cat.color,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Administration Hub & District Origins */}
          <div className="admin-analytics-row">
            {/* Quick Admin Actions */}
            <div className="vd-card">
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#1a2e22" }}>
                Administrative Quick Actions
              </h3>
              <div className="admin-quick-actions-grid">
                <Link to="/admin/coupons" className="admin-action-card">
                  <div className="admin-action-icon" style={{ background: "#edf8f0", color: "#168d51" }}>
                    <Tag size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: 13, display: "block" }}>Promo Coupons</strong>
                    <small style={{ color: "#667f70", fontSize: 11 }}>Manage discounts</small>
                  </div>
                </Link>

                <Link to="/admin/settings" className="admin-action-card">
                  <div className="admin-action-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                    <SettingsIcon size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: 13, display: "block" }}>Platform Settings</strong>
                    <small style={{ color: "#667f70", fontSize: 11 }}>Delivery &amp; rates</small>
                  </div>
                </Link>

                <Link to="/admin/vendors?status=under_review" className="admin-action-card">
                  <div className="admin-action-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                    <Store size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: 13, display: "block" }}>Review Vendors</strong>
                    <small style={{ color: "#667f70", fontSize: 11 }}>{data.pendingVendors} pending</small>
                  </div>
                </Link>

                <Link to="/admin/support" className="admin-action-card">
                  <div className="admin-action-icon" style={{ background: "#fdf2f8", color: "#db2777" }}>
                    <Mail size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: 13, display: "block" }}>Support Inbox</strong>
                    <small style={{ color: "#667f70", fontSize: 11 }}>{openTickets.length} open tickets</small>
                  </div>
                </Link>
              </div>
            </div>

            {/* Leading Origin Districts */}
            <div className="vd-card">
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#1a2e22" }}>
                Top Producing Farm Districts
              </h3>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { district: "Mustang", produce: "Royal Apples & Dried Rings", vendors: 4, revenue: "Rs. 18,200" },
                  { district: "Chitwan", produce: "Organic Honey & Bananas", vendors: 5, revenue: "Rs. 15,400" },
                  { district: "Ilam", produce: "Orthodox Golden Tip Tea", vendors: 3, revenue: "Rs. 12,900" },
                  { district: "Kavre", produce: "Fresh Milk & Leafy Greens", vendors: 6, revenue: "Rs. 11,800" },
                  { district: "Palpa", produce: "Organic Ginger & Arabica Coffee", vendors: 2, revenue: "Rs. 8,600" },
                ].map((d) => (
                  <div
                    key={d.district}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "#f8faf8",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong style={{ color: "#1a2e22", fontSize: 12.5, display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{d.district}</strong>
                      <div style={{ fontSize: 10.5, color: "#667f70", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{d.produce}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <strong style={{ color: "#168d51", fontSize: 12.5, display: "block" }}>{d.revenue}</strong>
                      <div style={{ fontSize: 10.5, color: "#667f70" }}>{d.vendors} active farms</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Vendors Quick Approve Widget */}
          {pendingVendors.length > 0 && (
            <div className="vd-card" style={{ marginBottom: 24 }}>
              <div className="vd-card-head">
                <div>
                  <h2 style={{ fontSize: 17, margin: 0 }}>Pending Vendor Applications</h2>
                  <p style={{ color: "#667f70", margin: "2px 0 0", fontSize: 13 }}>
                    Review new local farmers and suppliers requesting to sell on GoogleDoko.
                  </p>
                </div>
                <Link to="/admin/vendors" style={{ fontSize: 13, fontWeight: 700, color: "#168d51" }}>
                  View All Vendors →
                </Link>
              </div>
              <div className="vd-table-wrap">
                <table className="vd-table">
                  <thead>
                    <tr>
                      <th>Business Name</th>
                      <th>Owner &amp; Contact</th>
                      <th>Category &amp; Location</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingVendors.slice(0, 5).map((vendor) => (
                      <tr key={vendor.user_id}>
                        <td>
                          <strong>{vendor.business_name}</strong>
                          <div><small>{vendor.vendor_type}</small></div>
                        </td>
                        <td>
                          {vendor.first_name} {vendor.last_name}
                          <div><small>{vendor.phone} • {vendor.email}</small></div>
                        </td>
                        <td>
                          <span className="ad-badge-info">{vendor.category}</span>
                          <div><small>{vendor.location}, {vendor.district}</small></div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="auth-btn"
                            style={{ padding: "6px 14px", fontSize: 13, background: "#168d51" }}
                            onClick={async () => {
                              await mutate(() => api.adminVendorStatus(vendor.user_id, "approved"));
                              showToast(`Approved ${vendor.business_name}`);
                            }}
                          >
                            <Check size={14} /> Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Orders Section */}
          <div className="recent-orders-card">
            <div className="recent-orders-header">
              <div>
                <h2 style={{ fontSize: 17, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Receipt size={18} color="#168d51" /> Recent Orders
                </h2>
                <p style={{ color: "#667f70", margin: "4px 0 0", fontSize: 13 }}>
                  Latest orders placed by customers across Nepal.
                </p>
              </div>
              <Link
                to="/admin/orders"
                style={{
                  fontSize: 13, fontWeight: 700, color: "#168d51",
                  background: "#edf8f0", border: "1px solid #b6dfc6",
                  borderRadius: 8, padding: "7px 16px", textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 5
                }}
              >
                <Truck size={13} /> Manage All Orders →
              </Link>
            </div>
            <div className="ad-card-table">
              <table className="ad-order-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentOrders || []).slice(0, 6).map((order) => {
                    const customerName = order.recipient_name || `${order.first_name} ${order.last_name}`;
                    const initial = customerName.charAt(0).toUpperCase();
                    const pm = (order.payment_method || "").toLowerCase();
                    const payClass = pm.includes("esewa") ? "pay-badge-esewa" : pm.includes("khalti") ? "pay-badge-khalti" : "pay-badge-cod";
                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="order-id-badge">#{order.id.slice(0, 8)}</div>
                          <div style={{ color: "#8faa98", fontSize: 11, marginTop: 3 }}>
                            <Calendar size={10} style={{ verticalAlign: "middle", marginRight: 3 }} />
                            {new Date(order.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </div>
                        </td>
                        <td>
                          <div className="customer-avatar-chip">
                            <div className="cac-avatar">{initial}</div>
                            <div>
                              <div className="cac-name">{customerName}</div>
                              <div className="cac-addr">
                                <Navigation size={10} style={{ verticalAlign: "middle", marginRight: 2 }} />
                                {(order.delivery_address || "—").slice(0, 28)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: "#168d51", fontSize: 14 }}>Rs. {order.total.toLocaleString()}</strong>
                        </td>
                        <td>
                          <span className={payClass}>{order.payment_method}</span>
                          <div style={{ marginTop: 4 }}>
                            <span className={order.payment_status === "Paid" ? "ad-badge-success" : "ad-badge-pending"} style={{ fontSize: 10, padding: "2px 7px" }}>
                              {order.payment_status}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={
                              order.status === "Delivered" ? "ad-badge-success"
                                : order.status === "Cancelled" ? "ad-badge-danger"
                                  : order.status === "Shipped" || order.status === "Out for Delivery" ? "ad-badge-info"
                                    : "ad-badge-pending"
                            }
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {(!recentOrders || recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "32px 0", color: "#667f70" }}>
                        <ShoppingBag size={28} style={{ display: "block", margin: "0 auto 8px", opacity: 0.4 }} />
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ========================================================
// 2. ORDERS (AdminOrders)
// ========================================================
export function AdminOrders() {
  const state = useData<AdminOrder[]>(api.adminOrders);
  const [params, setParams] = useSearchParams();
  const activeTab = params.get("status") || "All";
  const search = (params.get("q") || "").trim().toLowerCase();
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const { showToast } = useAccount();

  const statuses = ["All", "Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

  const filteredOrders = useMemo(() => {
    return (state.data || []).filter((order) => {
      const matchStatus = activeTab === "All" || order.status === activeTab;
      const orderIdStr = String(order.id || "").toLowerCase();
      const recipientName = (order.recipient_name || (order as any).recipientName || "").toLowerCase();
      const email = (order.email || "").toLowerCase();
      const deliveryAddress = (order.delivery_address || (order as any).deliveryAddress || "").toLowerCase();

      const matchQuery =
        !search ||
        orderIdStr.includes(search) ||
        recipientName.includes(search) ||
        email.includes(search) ||
        deliveryAddress.includes(search);
      return matchStatus && matchQuery;
    });
  }, [state.data, activeTab, search]);

  async function handleStatusChange(orderId: string, nextStatus: string) {
    await state.mutate(() => api.adminOrderStatus(orderId, nextStatus));
    showToast(`Order ${orderId} updated to ${nextStatus}`);
  }

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Orders & Fulfillment"
        subtitle="Track delivery status, review customer shipping information, and verify cash collection."
        refresh={state.load}
        busy={state.busy}
        actions={
          <button
            type="button"
            className="vd-add-btn"
            style={{ background: "#edf8f0", color: "#168d51", border: "1px solid #c2e2cc" }}
            disabled={!filteredOrders.length}
            onClick={() =>
              exportCsv(
                `googledoko-orders-${Date.now()}.csv`,
                filteredOrders.map((o) => {
                  const customerName =
                    o.recipient_name ||
                    (o as any).recipientName ||
                    `${(o as any).first_name || (o as any).firstName || ""} ${(o as any).last_name || (o as any).lastName || ""}`.trim() ||
                    "Customer";
                  return {
                    ID: o.id,
                    Date: o.date,
                    Customer: customerName,
                    Email: o.email || "",
                    Phone: o.recipient_phone || (o as any).recipientPhone || "",
                    Address: o.delivery_address || (o as any).deliveryAddress || "",
                    Total: o.total ?? 0,
                    PaymentMethod: o.payment_method || (o as any).paymentMethod || "Cash on Delivery",
                    PaymentStatus: o.payment_status || (o as any).paymentStatus || "Pending",
                    Status: o.status || "Pending",
                  };
                }),
              )
            }
          >
            <Download size={15} /> Export Orders
          </button>
        }
      />

      {/* Order Metrics Bar */}
      <div className="orders-overview-metrics">
        {[
          {
            icon: <Receipt size={20} />, label: "Total Orders",
            value: (state.data || []).length, color: "#168d51", bg: "#edf8f0"
          },
          {
            icon: <CheckCircle2 size={20} />, label: "Delivered",
            value: (state.data || []).filter(o => o.status === "Delivered").length, color: "#0f6f3f", bg: "#d6f5e5"
          },
          {
            icon: <Clock size={20} />, label: "Pending / Processing",
            value: (state.data || []).filter(o => ["Pending", "Processing"].includes(o.status)).length, color: "#b45309", bg: "#fef9ee"
          },
          {
            icon: <Truck size={20} />, label: "Out for Delivery",
            value: (state.data || []).filter(o => o.status === "Shipped" || o.status === "Out for Delivery").length, color: "#1d6fb4", bg: "#eff6ff"
          },
          {
            icon: <Ban size={20} />, label: "Cancelled",
            value: (state.data || []).filter(o => o.status === "Cancelled").length, color: "#b91c1c", bg: "#fef2f2"
          },
        ].map((m, i) => (
          <div key={i} className="order-metric-card" style={{ borderLeft: `4px solid ${m.color}` }}>
            <div className="omc-icon" style={{ background: m.bg, color: m.color }}>{m.icon}</div>
            <div>
              <div className="omc-value" style={{ color: m.color }}>{m.value}</div>
              <div className="omc-label">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="ad-filter-tabs">
        {statuses.map((s) => {
          const count = (state.data || []).filter((o) => s === "All" || o.status === s).length;
          return (
            <button
              key={s}
              type="button"
              className={`ad-filter-tab${activeTab === s ? " active" : ""}`}
              onClick={() => {
                const next = new URLSearchParams(params);
                if (s === "All") next.delete("status");
                else next.set("status", s);
                setParams(next);
              }}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {state.error && <p className="auth-error">{state.error}</p>}

      {/* Orders Table */}
      <div className="ad-card-table">
        <table className="ad-order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer & Delivery</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const customerName =
                order.recipient_name ||
                (order as any).recipientName ||
                `${(order as any).first_name || (order as any).firstName || ""} ${(order as any).last_name || (order as any).lastName || ""}`.trim() ||
                "Customer";
              const initial = customerName.charAt(0).toUpperCase() || "C";
              const paymentMethod = order.payment_method || (order as any).paymentMethod || "Cash on Delivery";
              const paymentStatus = order.payment_status || (order as any).paymentStatus || "Pending";
              const deliveryAddress = order.delivery_address || (order as any).deliveryAddress || "—";
              const recipientPhone = order.recipient_phone || (order as any).recipientPhone || "";
              const orderStatus = order.status || "Pending";
              const pm = paymentMethod.toLowerCase();
              const payClass = pm.includes("esewa") ? "pay-badge-esewa" : pm.includes("khalti") ? "pay-badge-khalti" : "pay-badge-cod";
              const statusKey = orderStatus.toLowerCase().replace(/\s+/g, "_");

              let orderItems: { name: string; quantity: number; price: number }[] = [];
              if (Array.isArray(order.items)) {
                orderItems = order.items;
              } else if (typeof (order as any).itemsJson === "string") {
                try {
                  orderItems = JSON.parse((order as any).itemsJson);
                } catch {
                  orderItems = [];
                }
              }

              const orderDate = order.date || (order as any).createdAt;
              const formattedDate =
                orderDate && !isNaN(new Date(orderDate).getTime())
                  ? new Date(orderDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                  : "—";

              return (
                <tr key={order.id}>
                  <td>
                    <div className="order-id-badge">#{String(order.id).slice(0, 8)}</div>
                    <div style={{ color: "#8faa98", fontSize: 11, marginTop: 3 }}>
                      <Calendar size={10} style={{ verticalAlign: "middle", marginRight: 3 }} />
                      {formattedDate}
                    </div>
                  </td>
                  <td>
                    <div className="customer-avatar-chip">
                      <div className="cac-avatar">{initial}</div>
                      <div>
                        <div className="cac-name">{customerName}</div>
                        <div className="cac-addr" title={deliveryAddress}>
                          <MapPin size={10} style={{ verticalAlign: "middle", marginRight: 2 }} />
                          {deliveryAddress.slice(0, 32)}
                        </div>
                        <div style={{ color: "#8faa98", fontSize: 11, marginTop: 1 }}>
                          {recipientPhone ? `${recipientPhone} · ` : ""}{order.email || ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "#1a3d27" }}>
                      {orderItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} items
                    </span>
                    <div style={{ color: "#667f70", fontSize: 11, marginTop: 2, maxWidth: 160 }}>
                      {orderItems.map((i) => `${i.name || "Item"} ×${i.quantity || 1}`).join(", ").slice(0, 50)}
                      {orderItems.map((i) => `${i.name || "Item"} ×${i.quantity || 1}`).join(", ").length > 50 ? "…" : ""}
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: 15, color: "#168d51" }}>Rs. {(order.total ?? 0).toLocaleString()}</strong>
                  </td>
                  <td>
                    <span className={payClass}>{paymentMethod}</span>
                    <div style={{ marginTop: 5 }}>
                      <span className={paymentStatus === "Paid" ? "ad-badge-success" : "ad-badge-pending"}
                        style={{ fontSize: 10, padding: "2px 7px" }}>
                        {paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td>
                    <select
                      value={orderStatus}
                      disabled={state.busy || orderStatus === "Cancelled"}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`fulfillment-select ${statusKey}`}
                    >
                      {statuses
                        .filter((s) => s !== "All")
                        .map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      style={{ background: "#edf8f0", color: "#168d51", padding: "7px 12px", borderRadius: 8, border: "1px solid #b6dfc6", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700, fontSize: 12 }}
                      onClick={() => setSelectedOrder(order)}
                      title="View invoice details"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "36px 0", color: "#667f70" }}>
                  No orders match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (() => {
        let modalItems: { name: string; quantity: number; price: number }[] = [];
        if (Array.isArray(selectedOrder.items)) {
          modalItems = selectedOrder.items;
        } else if (typeof (selectedOrder as any).itemsJson === "string") {
          try {
            modalItems = JSON.parse((selectedOrder as any).itemsJson);
          } catch {
            modalItems = [];
          }
        }
        const selCustomer =
          selectedOrder.recipient_name ||
          (selectedOrder as any).recipientName ||
          `${(selectedOrder as any).first_name || (selectedOrder as any).firstName || ""} ${(selectedOrder as any).last_name || (selectedOrder as any).lastName || ""}`.trim() ||
          "Customer";
        const selDate = selectedOrder.date || (selectedOrder as any).createdAt;
        const selFormattedDate =
          selDate && !isNaN(new Date(selDate).getTime())
            ? new Date(selDate).toLocaleString()
            : "—";

        return (
          <div className="ad-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="ad-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="ad-modal-head">
                <div>
                  <h2>Order #{selectedOrder.id}</h2>
                  <small style={{ color: "#667f70" }}>
                    Placed on {selFormattedDate}
                  </small>
                </div>
                <button
                  type="button"
                  className="vd-icon-btn"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="ad-modal-body">
                {/* Delivery and Customer Info */}
                <div style={{ background: "#f8faf8", padding: 16, borderRadius: 12, marginBottom: 18, border: "1px solid #edf2ee" }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#168d51" }}>Customer &amp; Shipping Details</h4>
                  <p style={{ margin: "2px 0", fontSize: 14 }}>
                    <strong>Recipient:</strong> {selCustomer}
                  </p>
                  <p style={{ margin: "2px 0", fontSize: 14 }}>
                    <strong>Phone:</strong> {selectedOrder.recipient_phone || (selectedOrder as any).recipientPhone || "—"}
                  </p>
                  <p style={{ margin: "2px 0", fontSize: 14 }}>
                    <strong>Email:</strong> {selectedOrder.email || "—"}
                  </p>
                  <p style={{ margin: "2px 0", fontSize: 14 }}>
                    <strong>Address:</strong> {selectedOrder.delivery_address || (selectedOrder as any).deliveryAddress || "—"}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 14 }}>
                    <strong>Payment:</strong> {selectedOrder.payment_method || (selectedOrder as any).paymentMethod || "Cash on Delivery"} ({selectedOrder.payment_status || (selectedOrder as any).paymentStatus || "Pending"})
                  </p>
                </div>

                {/* Order Items List */}
                <h4 style={{ margin: "0 0 10px", fontSize: 15 }}>Order Items</h4>
                <div style={{ border: "1px solid #e9f0ec", borderRadius: 10, padding: "8px 14px" }}>
                  {modalItems.map((item, idx) => (
                    <div key={idx} className="ad-item-row">
                      <div>
                        <strong>{item.name || "Item"}</strong>
                        <div style={{ color: "#667f70", fontSize: 12 }}>Qty: {item.quantity || 1} × Rs. {item.price || 0}</div>
                      </div>
                      <strong>Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</strong>
                    </div>
                  ))}
                  {modalItems.length === 0 && (
                    <div style={{ color: "#667f70", fontSize: 13, padding: "10px 0" }}>No item details recorded</div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 6, borderTop: "2px solid #168d51", fontSize: 16 }}>
                    <strong>Total Amount:</strong>
                    <strong style={{ color: "#168d51" }}>Rs. {(selectedOrder.total ?? 0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
              <div className="ad-modal-foot">
                <button
                  type="button"
                  className="auth-btn ghost"
                  style={{ width: "auto" }}
                  onClick={() => window.print()}
                >
                  <Printer size={15} /> Print Invoice
                </button>
                <button
                  type="button"
                  className="auth-btn"
                  style={{ width: "auto" }}
                  onClick={() => setSelectedOrder(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ========================================================
// 3. CATALOG & PRODUCTS (AdminProducts)
// ========================================================
const PRODUCT_CATEGORY_META: Record<string, { emoji: string; short: string }> = {
  "Fresh Vegetables": { emoji: "🥬", short: "Vegetables" },
  "Organic Fruits": { emoji: "🍎", short: "Fruits" },
  "Dairy & Eggs": { emoji: "🥛", short: "Dairy & Eggs" },
  "Local Grains & Rice": { emoji: "🌾", short: "Grains & Rice" },
  "Traditional Spices & Herbs": { emoji: "🌿", short: "Spices & Herbs" },
  "Himalayan Tea & Coffee": { emoji: "☕", short: "Tea & Coffee" },
  "Honey & Preserves": { emoji: "🍯", short: "Honey & Preserves" },
  "Bakery & Sweets": { emoji: "🥐", short: "Bakery & Sweets" },
  "Others": { emoji: "📦", short: "Others" },
};

function getProductFallbackImage(name?: string, category?: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("carrot")) return "/src/frontend/assets/images/products/carrot.jpg";
  if (n.includes("apple")) return "/src/frontend/assets/images/products/apple.jpg";
  if (n.includes("orange")) return "/src/frontend/assets/images/products/orange.jpg";
  if (n.includes("tomato")) return "/src/frontend/assets/images/products/tomato.jpg";
  if (n.includes("potato")) return "/src/frontend/assets/images/products/potato.jpg";
  if (n.includes("honey")) return "/src/frontend/assets/images/products/honey.jpg";
  if (n.includes("milk")) return "/src/frontend/assets/images/products/milk.jpg";
  if (n.includes("egg")) return "/src/frontend/assets/images/products/eggs.jpg";
  if (n.includes("rice")) return "/src/frontend/assets/images/products/rice.jpg";
  if (n.includes("spinach")) return "/src/frontend/assets/images/products/spinach.jpg";
  if (n.includes("banana")) return "/src/frontend/assets/images/products/banana.jpg";

  const c = (category || "").toLowerCase();
  if (c.includes("fruit")) return "/src/frontend/assets/images/categories/fruits.jpg";
  if (c.includes("dairy")) return "/src/frontend/assets/images/products/milk.jpg";
  if (c.includes("grain")) return "/src/frontend/assets/images/categories/grains.jpg";
  if (c.includes("spice")) return "/src/frontend/assets/images/categories/spices.jpg";
  return "/src/frontend/assets/images/organic-vegetables.jpg";
}

export function AdminProducts() {
  const state = useData<AdminProduct[]>(api.adminProducts);
  const [params, setParams] = useSearchParams();
  const categoryFilter = params.get("category") || "All";
  const [searchQuery, setSearchQuery] = useState(params.get("q") || "");
  const [stockFilter, setStockFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [activeProduct, setActiveProduct] = useState<Partial<AdminProduct>>({});
  const { showToast } = useAccount();

  useEffect(() => {
    setSearchQuery(params.get("q") || "");
  }, [params]);

  useEffect(() => {
    if (params.get("action") === "new") {
      setModalMode("create");
      setActiveProduct({
        name: "",
        category: "Fresh Vegetables",
        weight: "1 kg",
        price: 150,
        stock: 50,
        origin: "Kathmandu, Nepal",
        seller: "GoogleDoko Store",
        description: "",
        image: "",
        active: 1,
      });
      const next = new URLSearchParams(params);
      next.delete("action");
      setParams(next);
    }
  }, [params, setParams]);

  // Catalog KPI metrics
  const metrics = useMemo(() => {
    const list = state.data || [];
    const total = list.length;
    const active = list.filter((p) => p.active === 1).length;
    const lowStock = list.filter((p) => p.stock <= 10 && p.stock > 0).length;
    const outOfStock = list.filter((p) => p.stock === 0).length;
    const activeCategories = new Set(list.map((p) => p.category)).size;
    return { total, active, lowStock, outOfStock, activeCategories };
  }, [state.data]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (state.data || []).filter((p) => {
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.origin || "").toLowerCase().includes(q) ||
        (p.seller || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q);
      const matchStock =
        stockFilter === "All" ||
        (stockFilter === "in_stock" && p.stock > 10) ||
        (stockFilter === "low_stock" && p.stock <= 10 && p.stock > 0) ||
        (stockFilter === "out_of_stock" && p.stock === 0);
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "active" && p.active === 1) ||
        (statusFilter === "hidden" && p.active === 0);
      return matchCat && matchQuery && matchStock && matchStatus;
    });
  }, [state.data, categoryFilter, searchQuery, stockFilter, statusFilter]);

  const hasActiveFilters =
    categoryFilter !== "All" ||
    searchQuery.trim().length > 0 ||
    stockFilter !== "All" ||
    statusFilter !== "All";

  function clearAllFilters() {
    setSearchQuery("");
    setStockFilter("All");
    setStatusFilter("All");
    const next = new URLSearchParams(params);
    next.delete("category");
    next.delete("q");
    setParams(next);
  }

  async function handleSaveProduct(e: FormEvent) {
    e.preventDefault();
    if (!activeProduct.name?.trim() || !activeProduct.price) {
      showToast("Please enter product name and price");
      return;
    }

    try {
      const payload = {
        ...activeProduct,
        image: activeProduct.image?.trim() || getProductFallbackImage(activeProduct.name, activeProduct.category),
      };
      if (modalMode === "edit" && activeProduct.id) {
        await state.mutate(() => api.adminSaveProduct(activeProduct.id!, payload));
        showToast(`Updated product "${activeProduct.name}"`);
      } else {
        await state.mutate(() => api.adminSaveProduct(null, payload));
        showToast(`Added product "${activeProduct.name}"`);
      }
      setModalMode(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save product");
    }
  }

  async function handleDelete(product: AdminProduct) {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      await state.mutate(() => api.adminRemoveProduct(product.id));
      showToast(`Deleted ${product.name}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not delete product");
    }
  }

  async function toggleActive(product: AdminProduct) {
    const nextState = product.active ? 0 : 1;
    await state.mutate(() => api.adminProductUpdate(product.id, { active: nextState }));
    showToast(`${product.name} is now ${nextState ? "published" : "hidden"}`);
  }

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Catalog &amp; Inventory"
        subtitle="Manage product listings, pricing, availability and inventory across all Nepal categories."
        refresh={state.load}
        busy={state.busy}
        actions={
          <button
            type="button"
            className="vd-add-btn"
            onClick={() => {
              setModalMode("create");
              setActiveProduct({
                name: "",
                category: "Fresh Vegetables",
                weight: "1 kg",
                price: 150,
                stock: 50,
                origin: "Kathmandu, Nepal",
                seller: "GoogleDoko Store",
                description: "",
                image: "",
                active: 1,
              });
            }}
          >
            <Plus size={16} /> Add Product
          </button>
        }
      />

      {/* Catalog KPI Stats Grid */}
      <div className="ad-catalog-stats">
        <div className="ad-catalog-stat-card">
          <div className="ad-catalog-stat-icon" style={{ background: "#edf8f0", color: "#168d51" }}>
            <Package size={22} />
          </div>
          <div className="ad-catalog-stat-info">
            <strong>{metrics.total}</strong>
            <span>Total Catalog Products</span>
          </div>
        </div>

        <div className="ad-catalog-stat-card">
          <div className="ad-catalog-stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="ad-catalog-stat-info">
            <strong>{metrics.active}</strong>
            <span>Published &amp; Live</span>
          </div>
        </div>

        <div className="ad-catalog-stat-card">
          <div className="ad-catalog-stat-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
            <AlertTriangle size={22} />
          </div>
          <div className="ad-catalog-stat-info">
            <strong>{metrics.lowStock + metrics.outOfStock}</strong>
            <span>Low / Out of Stock</span>
          </div>
        </div>

        <div className="ad-catalog-stat-card">
          <div className="ad-catalog-stat-icon" style={{ background: "#f0fdfa", color: "#0d9488" }}>
            <Layers size={22} />
          </div>
          <div className="ad-catalog-stat-info">
            <strong>{metrics.activeCategories} / {PRODUCT_CATEGORIES.length}</strong>
            <span>Active Categories</span>
          </div>
        </div>
      </div>

      {/* Enhanced Management & Category Filter Bar */}
      <div className="ad-catalog-card">
        {/* Toolbar: Search & Select Filters */}
        <div className="ad-catalog-toolbar">
          <div className="ad-catalog-search-wrap">
            <Search size={16} className="ad-catalog-search-icon" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                const next = new URLSearchParams(params);
                if (val.trim()) next.set("q", val.trim());
                else next.delete("q");
                setParams(next);
              }}
              placeholder="Search by product name, origin, seller..."
              aria-label="Search catalog products"
            />
            {searchQuery && (
              <button
                type="button"
                className="ad-catalog-search-clear"
                onClick={() => {
                  setSearchQuery("");
                  const next = new URLSearchParams(params);
                  next.delete("q");
                  setParams(next);
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="ad-catalog-filter-controls">
            {/* Quick Category Select */}
            <select
              className="ad-catalog-select"
              value={categoryFilter}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                if (e.target.value === "All") next.delete("category");
                else next.set("category", e.target.value);
                setParams(next);
              }}
              aria-label="Select category"
            >
              <option value="All">All Categories ({(state.data || []).length})</option>
              {PRODUCT_CATEGORIES.map((c) => {
                const count = (state.data || []).filter((p) => p.category === c).length;
                return (
                  <option key={c} value={c}>
                    {c} ({count})
                  </option>
                );
              })}
            </select>

            {/* Stock Filter */}
            <select
              className="ad-catalog-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              aria-label="Filter by stock status"
            >
              <option value="All">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt;10)</option>
              <option value="low_stock">Low Stock (1-10)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            {/* Status Filter */}
            <select
              className="ad-catalog-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by publication status"
            >
              <option value="All">All Status</option>
              <option value="active">Published Only</option>
              <option value="hidden">Hidden Only</option>
            </select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                className="ad-catalog-reset-btn"
                onClick={clearAllFilters}
                title="Reset all filters"
              >
                <RotateCcw size={13} /> Clear
              </button>
            )}

            <span className="ad-catalog-count-badge">
              Showing <strong>{filteredProducts.length}</strong> of {(state.data || []).length}
            </span>
          </div>
        </div>

        {/* Category Chips Track (Horizontal Single-Line Scrollable) */}
        <div className="ad-catalog-chips-track">
          <button
            type="button"
            className={`ad-category-chip${categoryFilter === "All" ? " active" : ""}`}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete("category");
              setParams(next);
            }}
          >
            <span className="chip-emoji">🧺</span>
            <span>All Categories</span>
            <span className="chip-count has-items">{(state.data || []).length}</span>
          </button>

          {PRODUCT_CATEGORIES.map((c) => {
            const count = (state.data || []).filter((p) => p.category === c).length;
            const meta = PRODUCT_CATEGORY_META[c] || { emoji: "📦", short: c };
            const isActive = categoryFilter === c;
            return (
              <button
                key={c}
                type="button"
                className={`ad-category-chip${isActive ? " active" : ""}`}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set("category", c);
                  setParams(next);
                }}
              >
                <span className="chip-emoji">{meta.emoji}</span>
                <span>{c}</span>
                <span className={`chip-count${count > 0 ? " has-items" : " zero"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {state.error && <p className="auth-error">{state.error}</p>}

      {/* Products Table */}
      <div className="vd-table-wrap">
        <table className="vd-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category &amp; Origin</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f1f5f2", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img
                        src={product.image || getProductFallbackImage(product.name, product.category)}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getProductFallbackImage(product.name, product.category);
                        }}
                      />
                    </div>
                    <div>
                      <strong>{product.name}</strong>
                      <div>
                        <small>
                          Sold per {resolveProductSellingUnit(product.category, (product as any).sellingUnit, product.weight)}
                          {product.weight ? ` • ${product.weight}` : ""}
                        </small>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="ad-badge-info">{product.category}</span>
                  <div style={{ fontSize: 12, color: "#556e5d", marginTop: 3 }}>
                    <MapPin size={11} style={{ display: "inline" }} /> {product.origin || "Nepal"}
                  </div>
                </td>
                <td>{product.seller || "GoogleDoko Store"}</td>
                <td>
                  <strong style={{ color: "#168d51", fontSize: 14 }}>
                    Rs. {product.price} / {resolveProductSellingUnit(product.category, (product as any).sellingUnit, product.weight)}
                  </strong>
                </td>
                <td>
                  <span className={product.stock > 10 ? "ad-badge-success" : product.stock > 0 ? "ad-badge-pending" : "ad-badge-danger"}>
                    {product.stock} units
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => toggleActive(product)}
                    style={{
                      border: "none",
                      background: product.active ? "#e8f7ed" : "#f1f5f2",
                      color: product.active ? "#166534" : "#667f70",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    title="Click to toggle publish status"
                  >
                    {product.active ? "Published" : "Hidden"}
                  </button>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      className="auth-btn ghost"
                      style={{ padding: "6px 10px", fontSize: 12, width: "auto" }}
                      onClick={() => {
                        setModalMode("edit");
                        setActiveProduct({ ...product });
                      }}
                      title="Edit product"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className="auth-btn ghost"
                      style={{ padding: "6px 10px", fontSize: 12, width: "auto", color: "#c44545", borderColor: "#fecaca" }}
                      onClick={() => handleDelete(product)}
                      title="Delete product"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px 16px", color: "#667f70" }}>
                  <Package size={32} style={{ display: "block", margin: "0 auto 10px", opacity: 0.4 }} />
                  <strong style={{ display: "block", color: "#334e3e", fontSize: 15, marginBottom: 4 }}>
                    No products match your filters
                  </strong>
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    Try changing your category selection, stock level, or search keyword.
                  </span>
                  {hasActiveFilters && (
                    <div style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        style={{
                          padding: "6px 14px",
                          fontSize: 12,
                          borderRadius: 8,
                          border: "1px solid #c2e2cc",
                          background: "#edf8f0",
                          color: "#168d51",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {modalMode && (
        <div className="ad-modal-overlay" onClick={() => setModalMode(null)}>
          <div className="ad-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-head">
              <h2>{modalMode === "create" ? "Add New Product" : `Edit "${activeProduct.name}"`}</h2>
              <button type="button" className="vd-icon-btn" onClick={() => setModalMode(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="ad-modal-body">
                <div className="auth-form-grid">
                  <label className="auth-field auth-full-width">
                    <span>Product Name *</span>
                    <input
                      required
                      value={activeProduct.name || ""}
                      onChange={(e) => setActiveProduct({ ...activeProduct, name: e.target.value })}
                      placeholder="e.g. Organic Jumla Apple, Ilam Orthodox Tea"
                    />
                  </label>

                  <label className="auth-field">
                    <span>Category *</span>
                    <select
                      value={activeProduct.category || PRODUCT_CATEGORIES[0]}
                      onChange={(e) => setActiveProduct({ ...activeProduct, category: e.target.value })}
                    >
                      {PRODUCT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="auth-field">
                    <span>Selling Unit *</span>
                    <select
                      value={(activeProduct as any).sellingUnit || resolveProductSellingUnit(activeProduct.category, undefined, activeProduct.weight)}
                      onChange={(e) => setActiveProduct({ ...activeProduct, sellingUnit: e.target.value } as any)}
                    >
                      {getAllowedUnitsForCategory(activeProduct.category).map((u) => (
                        <option key={u} value={u}>
                          Per {u} ({u.charAt(0).toUpperCase() + u.slice(1)})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="auth-field">
                    <span>Physical Weight / Dimensions (Optional)</span>
                    <input
                      value={activeProduct.weight || ""}
                      onChange={(e) => setActiveProduct({ ...activeProduct, weight: e.target.value })}
                      placeholder="e.g. 1 kg, 35 kg net, 120x80 cm"
                    />
                  </label>

                  <label className="auth-field">
                    <span>Price in Rs. *</span>
                    <input
                      required
                      type="number"
                      min="1"
                      step="1"
                      value={activeProduct.price ?? ""}
                      onChange={(e) => setActiveProduct({ ...activeProduct, price: Number(e.target.value) })}
                    />
                  </label>

                  <label className="auth-field">
                    <span>Stock Inventory *</span>
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={activeProduct.stock ?? ""}
                      onChange={(e) => setActiveProduct({ ...activeProduct, stock: Number(e.target.value) })}
                    />
                  </label>

                  <label className="auth-field">
                    <span>Origin / Region</span>
                    <select
                      value={activeProduct.origin || NEPAL_LOCATIONS[0]}
                      onChange={(e) => setActiveProduct({ ...activeProduct, origin: e.target.value })}
                    >
                      {NEPAL_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="auth-field">
                    <span>Seller / Farm Name</span>
                    <input
                      value={activeProduct.seller || ""}
                      onChange={(e) => setActiveProduct({ ...activeProduct, seller: e.target.value })}
                      placeholder="e.g. GoogleDoko Store, Himalayan Honey Farm"
                    />
                  </label>

                  <label className="auth-field auth-full-width">
                    <span>Product Image</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        style={{ flex: 1 }}
                        value={activeProduct.image || ""}
                        onChange={(e) => setActiveProduct({ ...activeProduct, image: e.target.value })}
                        placeholder="/src/frontend/assets/images/... or web URL"
                      />
                      <label style={{ cursor: "pointer", background: "#16a34a", color: "#fff", padding: "6px 12px", borderRadius: 6, fontSize: 13, whiteSpace: "nowrap", fontWeight: 600 }}>
                        📁 Upload
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const result = await api.uploadImage(file);
                              setActiveProduct({ ...activeProduct, image: result.url });
                            } catch (err: unknown) {
                              const message = err instanceof Error ? err.message : "Unknown error";
                              alert("Upload failed: " + message);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {activeProduct.image && (
                      <img src={activeProduct.image} alt="preview" style={{ marginTop: 8, height: 60, borderRadius: 6, objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    )}
                  </label>

                  <label className="auth-field auth-full-width">
                    <span>Description &amp; Origin Details</span>
                    <textarea
                      rows={3}
                      value={activeProduct.description || ""}
                      onChange={(e) => setActiveProduct({ ...activeProduct, description: e.target.value })}
                      placeholder="Fresh harvest details, taste notes, storage advice..."
                    />
                  </label>

                  <label className="auth-check auth-full-width">
                    <input
                      type="checkbox"
                      checked={Boolean(activeProduct.active)}
                      onChange={(e) => setActiveProduct({ ...activeProduct, active: e.target.checked ? 1 : 0 })}
                    />
                    <span>Publish product in marketplace storefront</span>
                  </label>
                </div>
              </div>
              <div className="ad-modal-foot">
                <button type="button" className="auth-btn ghost" style={{ width: "auto" }} onClick={() => setModalMode(null)}>
                  Cancel
                </button>
                <button type="submit" className="auth-btn" style={{ width: "auto" }} disabled={state.busy}>
                  {state.busy ? "Saving..." : modalMode === "create" ? "Add to Catalog" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// 4. REVIEWS & MODERATION (AdminReviews)
// ========================================================
export function AdminReviews() {
  const state = useData<AdminReview[]>(api.adminReviews);
  const [params, setParams] = useSearchParams();
  const ratingFilter = params.get("rating") || "All";
  const [searchQuery, setSearchQuery] = useState(params.get("q") || "");
  const { showToast } = useAccount();

  useEffect(() => {
    setSearchQuery(params.get("q") || "");
  }, [params]);

  const metrics = useMemo(() => {
    const list = state.data || [];
    const total = list.length;
    const avg = total > 0 ? (list.reduce((acc, r) => acc + Number(r.rating || 5), 0) / total).toFixed(1) : "5.0";
    const fiveStar = list.filter((r) => Number(r.rating) === 5).length;
    const critical = list.filter((r) => Number(r.rating) <= 2).length;
    return { total, avg, fiveStar, critical };
  }, [state.data]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (state.data || []).filter((r) => {
      const matchRating = ratingFilter === "All" || String(r.rating) === ratingFilter;
      const matchQuery =
        !q ||
        (r.first_name || "").toLowerCase().includes(q) ||
        (r.last_name || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.product_name || "").toLowerCase().includes(q) ||
        (r.title || "").toLowerCase().includes(q) ||
        (r.body || "").toLowerCase().includes(q);
      return matchRating && matchQuery;
    });
  }, [state.data, ratingFilter, searchQuery]);

  async function handleDelete(review: AdminReview) {
    if (!window.confirm(`Delete review from "${review.first_name} ${review.last_name}" on ${review.product_name}?`)) return;
    try {
      await state.mutate(() => api.adminDeleteReview(review.id));
      showToast("Review deleted and product rating updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete review");
    }
  }

  async function handleStatusChange(review: AdminReview, nextStatus: string) {
    try {
      await state.mutate(() => api.adminReviewStatus(review.id, nextStatus));
      showToast(`Review marked as ${nextStatus}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update review status");
    }
  }

  function renderStars(rating: number) {
    return (
      <div style={{ display: "inline-flex", gap: 2, alignItems: "center", color: "#f59e0b" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? "#f59e0b" : "transparent"}
            color={star <= rating ? "#f59e0b" : "#cbd5e1"}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Customer Reviews &amp; Moderation"
        subtitle="Monitor customer feedback, star ratings, and moderate product reviews across the marketplace."
        refresh={state.load}
        busy={state.busy}
        actions={
          <button
            type="button"
            className="vd-add-btn"
            style={{ background: "#edf8f0", color: "#168d51", border: "1px solid #c2e2cc" }}
            disabled={!filtered.length}
            onClick={() =>
              exportCsv(
                `googledoko-reviews-${Date.now()}.csv`,
                filtered.map((r) => ({
                  ID: r.id,
                  Product: r.product_name,
                  Customer: `${r.first_name} ${r.last_name}`,
                  Email: r.email,
                  Rating: r.rating,
                  Title: r.title,
                  Review: r.body,
                  Date: r.created_at,
                }))
              )
            }
          >
            <Download size={15} /> Export Reviews
          </button>
        }
      />

      {/* Reviews KPI Stats */}
      <div className="ad-catalog-stats">
        <div className="ad-catalog-stat-card">
          <div className="ad-catalog-stat-icon" style={{ background: "#edf8f0", color: "#168d51" }}>
            <Award size={22} />
          </div>
          <div className="ad-catalog-stat-info">
            <strong>{metrics.total}</strong>
            <span>Total Verified Reviews</span>
          </div>
        </div>

        <div className="ad-catalog-stat-card">
          <div className="ad-catalog-stat-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
            <Star size={22} fill="#f59e0b" />
          </div>
          <div className="ad-catalog-stat-info">
            <strong>{metrics.avg} / 5.0</strong>
            <span>Marketplace Avg Rating</span>
          </div>
        </div>

        <div className="ad-catalog-stat-card">
          <div className="ad-catalog-stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="ad-catalog-stat-info">
            <strong>{metrics.fiveStar}</strong>
            <span>5-Star Reviews</span>
          </div>
        </div>

        <div className="ad-catalog-stat-card">
          <div className="ad-catalog-stat-icon" style={{ background: metrics.critical > 0 ? "#fef2f2" : "#f8fafc", color: metrics.critical > 0 ? "#dc2626" : "#64748b" }}>
            <AlertTriangle size={22} />
          </div>
          <div className="ad-catalog-stat-info">
            <strong style={{ color: metrics.critical > 0 ? "#dc2626" : "#1e293b" }}>{metrics.critical}</strong>
            <span>Critical Reviews (&le;2★)</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="ad-catalog-card" style={{ padding: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <div className="ad-catalog-search-wrap" style={{ maxWidth: 360 }}>
            <Search size={16} className="ad-catalog-search-icon" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                const next = new URLSearchParams(params);
                if (val.trim()) next.set("q", val.trim());
                else next.delete("q");
                setParams(next);
              }}
              placeholder="Search by customer, product, or review text..."
              aria-label="Search reviews"
            />
            {searchQuery && (
              <button
                type="button"
                className="ad-catalog-search-clear"
                onClick={() => {
                  setSearchQuery("");
                  const next = new URLSearchParams(params);
                  next.delete("q");
                  setParams(next);
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="ad-filter-tabs" style={{ margin: 0 }}>
            {["All", "5", "4", "3", "2", "1"].map((r) => {
              const count = (state.data || []).filter((item) => r === "All" || String(item.rating) === r).length;
              return (
                <button
                  key={r}
                  type="button"
                  className={`ad-filter-tab${ratingFilter === r ? " active" : ""}`}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    if (r === "All") next.delete("rating");
                    else next.set("rating", r);
                    setParams(next);
                  }}
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  {r === "All" ? `All (${count})` : `${r} ★ (${count})`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {state.error && <p className="auth-error">{state.error}</p>}

      {/* Reviews Table */}
      <div className="vd-table-wrap">
        <table className="vd-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Product</th>
              <th>Rating</th>
              <th>Review Details</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rev) => (
              <tr key={rev.id}>
                <td>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#edf8f0", color: "#168d51", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      {(rev.first_name || "C")[0].toUpperCase()}
                    </div>
                    <div>
                      <strong>{rev.first_name} {rev.last_name}</strong>
                      <div style={{ fontSize: 11, color: "#667f70" }}>{rev.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", background: "#f1f5f2", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img
                        src={rev.product_image || getProductFallbackImage(rev.product_name)}
                        alt={rev.product_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getProductFallbackImage(rev.product_name);
                        }}
                      />
                    </div>
                    <div>
                      <Link to={`/product/${rev.product_id}`} style={{ color: "#168d51", fontWeight: 600, textDecoration: "none" }}>
                        {rev.product_name}
                      </Link>
                      <div style={{ fontSize: 11, color: "#8aa394" }}>ID: #{rev.product_id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    {renderStars(Number(rev.rating))}
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginTop: 2 }}>
                      {rev.rating} out of 5
                    </div>
                  </div>
                </td>
                <td style={{ maxWidth: 320 }}>
                  {rev.title && <strong style={{ display: "block", fontSize: 13, color: "#1e293b", marginBottom: 2 }}>{rev.title}</strong>}
                  <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.4 }}>
                    {rev.body}
                  </p>
                </td>
                <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "#64748b" }}>
                  <div>{new Date(rev.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: rev.status === "approved" || !rev.status ? "#ecfdf5" : rev.status === "rejected" ? "#fef2f2" : "#fefce8",
                      color: rev.status === "approved" || !rev.status ? "#065f46" : rev.status === "rejected" ? "#991b1b" : "#854d0e",
                    }}
                  >
                    {(rev.status || "approved").toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {rev.status !== "approved" && (
                      <button
                        type="button"
                        className="auth-btn ghost"
                        style={{ padding: "4px 8px", fontSize: 11, width: "auto", color: "#059669", borderColor: "#a7f3d0" }}
                        onClick={() => handleStatusChange(rev, "approved")}
                        title="Approve review"
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== "rejected" && (
                      <button
                        type="button"
                        className="auth-btn ghost"
                        style={{ padding: "4px 8px", fontSize: 11, width: "auto", color: "#d97706", borderColor: "#fde68a" }}
                        onClick={() => handleStatusChange(rev, "rejected")}
                        title="Hide/Reject review"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      type="button"
                      className="auth-btn ghost"
                      style={{ padding: "4px 8px", fontSize: 11, width: "auto", color: "#c44545", borderColor: "#fecaca" }}
                      onClick={() => handleDelete(rev)}
                      title="Delete inappropriate review"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px 16px", color: "#667f70" }}>
                  <Star size={32} style={{ display: "block", margin: "0 auto 10px", opacity: 0.4 }} />
                  <strong style={{ display: "block", color: "#334e3e", fontSize: 15, marginBottom: 4 }}>
                    No reviews found
                  </strong>
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    No customer reviews match your search or rating filter.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========================================================
// 5. VENDORS (AdminVendors)
// ========================================================
export function AdminVendors() {
  const state = useData<AdminVendor[]>(api.adminVendors);
  const [params, setParams] = useSearchParams();
  const filter = params.get("status") || "All";
  const search = (params.get("q") || "").trim().toLowerCase();
  const [viewingVendor, setViewingVendor] = useState<AdminVendor | null>(null);
  const { showToast } = useAccount();

  const filtered = useMemo(() => {
    return (state.data || []).filter((v) => {
      const matchStatus = filter === "All" || v.status === filter;
      const matchSearch =
        !search ||
        v.business_name.toLowerCase().includes(search) ||
        v.first_name.toLowerCase().includes(search) ||
        v.last_name.toLowerCase().includes(search) ||
        v.email.toLowerCase().includes(search) ||
        (v.location && v.location.toLowerCase().includes(search)) ||
        (v.district && v.district.toLowerCase().includes(search));
      return matchStatus && matchSearch;
    });
  }, [state.data, filter, search]);

  async function updateStatus(
    vendor: AdminVendor,
    nextStatus: "approved" | "under_review" | "on_hold" | "rejected",
  ) {
    await state.mutate(() => api.adminVendorStatus(vendor.user_id, nextStatus));
    const label =
      nextStatus === "approved"
        ? `Approved ${vendor.business_name}`
        : nextStatus === "on_hold"
          ? `Placed ${vendor.business_name} on hold`
          : nextStatus === "rejected"
            ? `Rejected ${vendor.business_name}`
            : `Moved ${vendor.business_name} to review`;
    showToast(label);
    if (viewingVendor && viewingVendor.user_id === vendor.user_id) {
      setViewingVendor({ ...viewingVendor, status: nextStatus });
    }
  }

  function renderStatusBadge(status: string) {
    switch (status) {
      case "approved":
        return (
          <span className="ad-badge-success">
            <Check size={13} /> Active Approved
          </span>
        );
      case "on_hold":
        return (
          <span className="ad-badge-hold">
            <PauseCircle size={13} /> On Hold
          </span>
        );
      case "rejected":
        return (
          <span className="ad-badge-danger">
            <Ban size={13} /> Rejected
          </span>
        );
      default:
        return (
          <span className="ad-badge-pending">
            <Clock size={13} /> Under Review
          </span>
        );
    }
  }

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Vendors &amp; Farm Partners"
        subtitle="Review vendor applications, manage verified storefront status, and oversee local farm partnerships across Nepal."
        refresh={state.load}
        busy={state.busy}
        actions={
          <button
            type="button"
            className="vd-add-btn"
            style={{ background: "#edf8f0", color: "#168d51", border: "1px solid #c2e2cc" }}
            disabled={!filtered.length}
            onClick={() =>
              exportCsv(
                `googledoko-vendors-${Date.now()}.csv`,
                filtered.map((v) => ({
                  ID: v.user_id,
                  BusinessName: v.business_name,
                  Type: v.vendor_type,
                  Owner: `${v.first_name} ${v.last_name}`,
                  Email: v.email,
                  Phone: v.phone,
                  Location: v.location,
                  District: v.district,
                  Category: v.category,
                  Products: v.product_count || 0,
                  Status: v.status,
                  Joined: v.created_at,
                })),
              )
            }
          >
            <Download size={15} /> Export Vendors
          </button>
        }
      />

      <div className="ad-filter-tabs">
        <button
          type="button"
          className={`ad-filter-tab${filter === "All" ? " active" : ""}`}
          onClick={() => {
            const next = new URLSearchParams(params);
            next.delete("status");
            setParams(next);
          }}
        >
          All Vendors ({(state.data || []).length})
        </button>
        <button
          type="button"
          className={`ad-filter-tab${filter === "under_review" ? " active" : ""}`}
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set("status", "under_review");
            setParams(next);
          }}
        >
          Awaiting Review ({(state.data || []).filter((v) => v.status === "under_review").length})
        </button>
        <button
          type="button"
          className={`ad-filter-tab${filter === "approved" ? " active" : ""}`}
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set("status", "approved");
            setParams(next);
          }}
        >
          Approved Active ({(state.data || []).filter((v) => v.status === "approved").length})
        </button>
        <button
          type="button"
          className={`ad-filter-tab${filter === "on_hold" ? " active" : ""}`}
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set("status", "on_hold");
            setParams(next);
          }}
        >
          On Hold ({(state.data || []).filter((v) => v.status === "on_hold").length})
        </button>
        <button
          type="button"
          className={`ad-filter-tab${filter === "rejected" ? " active" : ""}`}
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set("status", "rejected");
            setParams(next);
          }}
        >
          Rejected ({(state.data || []).filter((v) => v.status === "rejected").length})
        </button>
      </div>

      {state.error && <p className="auth-error">{state.error}</p>}

      <div className="vd-table-wrap">
        <table className="vd-table">
          <thead>
            <tr>
              <th>Business / Farm</th>
              <th>Owner Contact</th>
              <th>Category</th>
              <th>Location</th>
              <th>Products</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((vendor) => (
              <tr key={vendor.user_id}>
                <td>
                  <strong>{vendor.business_name}</strong>
                  <div><small>{vendor.vendor_type || "Direct Farm"}</small></div>
                </td>
                <td>
                  <strong>{vendor.first_name} {vendor.last_name}</strong>
                  <div><small>{vendor.phone} • {vendor.email}</small></div>
                </td>
                <td>
                  <span className="ad-badge-info">{vendor.category}</span>
                </td>
                <td>
                  {vendor.location || "Kathmandu"}, {vendor.district || "Nepal"}
                </td>
                <td>
                  <strong style={{ color: "#168d51" }}>{vendor.product_count ?? 0}</strong> items
                </td>
                <td>
                  {renderStatusBadge(vendor.status)}
                </td>
                <td>
                  <div className="tbl-action-group">
                    {vendor.status === "approved" ? (
                      <button
                        type="button"
                        className="tbl-action-btn amber"
                        disabled={state.busy}
                        onClick={() => updateStatus(vendor, "on_hold")}
                        title="Put this vendor on hold"
                      >
                        <PauseCircle size={12} /> On Hold
                      </button>
                    ) : vendor.status === "on_hold" ? (
                      <button
                        type="button"
                        className="tbl-action-btn green"
                        disabled={state.busy}
                        onClick={() => updateStatus(vendor, "approved")}
                        title="Reactivate vendor storefront"
                      >
                        <CheckCircle2 size={12} /> Reactivate
                      </button>
                    ) : vendor.status === "rejected" ? (
                      <button
                        type="button"
                        className="tbl-action-btn light-green"
                        disabled={state.busy}
                        onClick={() => updateStatus(vendor, "under_review")}
                        title="Re-open vendor review"
                      >
                        <RefreshCw size={12} /> Re-review
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="tbl-action-btn green"
                          disabled={state.busy}
                          onClick={() => updateStatus(vendor, "approved")}
                          title="Approve vendor application"
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          type="button"
                          className="tbl-action-btn amber"
                          disabled={state.busy}
                          onClick={() => updateStatus(vendor, "on_hold")}
                          title="Put on hold"
                        >
                          <PauseCircle size={12} /> Hold
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="tbl-action-btn ghost-slate"
                      onClick={() => setViewingVendor(vendor)}
                    >
                      <Eye size={12} /> Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "36px 0", color: "#667f70" }}>
                  No vendors match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Redesigned Vendor Details Modal */}
      {viewingVendor && (
        <div className="ad-modal-overlay" onClick={() => setViewingVendor(null)}>
          <div className="ad-modal-card vendor-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Top Emerald Header */}
            <div className="vendor-modal-banner">
              <div className="vendor-modal-banner-content">
                <div className="vendor-modal-avatar">
                  {viewingVendor.photo ? (
                    <img src={viewingVendor.photo} alt={viewingVendor.business_name} />
                  ) : (
                    <span>{viewingVendor.business_name[0]?.toUpperCase() || "V"}</span>
                  )}
                </div>
                <div>
                  <h2 className="vendor-modal-title">{viewingVendor.business_name}</h2>
                  <p className="vendor-modal-subtitle">
                    <Store size={14} />
                    <span>{viewingVendor.vendor_type || "Direct Farm Partner"}</span>
                    <span>•</span>
                    <span>Managed by {viewingVendor.first_name} {viewingVendor.last_name}</span>
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {renderStatusBadge(viewingVendor.status)}
                <button
                  type="button"
                  className="vd-icon-btn"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff", border: "none", cursor: "pointer" }}
                  onClick={() => setViewingVendor(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="ad-modal-body" style={{ padding: "24px" }}>
              {/* 4-Box Key Metrics Row */}
              <div className="vendor-metrics-row">
                <div className="vendor-metric-box">
                  <div className="vendor-metric-label">Listed Products</div>
                  <div className="vendor-metric-value" style={{ color: "#168d51" }}>
                    {viewingVendor.product_count ?? 0} active
                  </div>
                </div>
                <div className="vendor-metric-box">
                  <div className="vendor-metric-label">Origin District</div>
                  <div className="vendor-metric-value">
                    {viewingVendor.district || viewingVendor.location?.split(",")[0] || "Nepal"}
                  </div>
                </div>
                <div className="vendor-metric-box">
                  <div className="vendor-metric-label">Primary Sector</div>
                  <div className="vendor-metric-value" style={{ fontSize: 13 }}>
                    {viewingVendor.category || "Organic Farm"}
                  </div>
                </div>
                <div className="vendor-metric-box">
                  <div className="vendor-metric-label">Partner Since</div>
                  <div className="vendor-metric-value" style={{ fontSize: 13 }}>
                    {new Date(viewingVendor.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Two-Column Structured Details */}
              <div className="vendor-details-grid">
                {/* Column 1: Farm Story & Production */}
                <div className="vendor-card-box">
                  <h4>
                    <Store size={15} /> Farm &amp; Production Profile
                  </h4>
                  <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
                    <div>
                      <strong style={{ color: "#2d4436", display: "block", marginBottom: 2 }}>Main Harvest / Produce:</strong>
                      <p style={{ margin: 0, color: "#4f6356", lineHeight: 1.5 }}>
                        {viewingVendor.main_products || "Local seasonal organic crops, fresh vegetables, fruits, and dairy harvest."}
                      </p>
                    </div>

                    <div>
                      <strong style={{ color: "#2d4436", display: "block", marginBottom: 2 }}>Farm Story &amp; Practices:</strong>
                      <p style={{ margin: 0, color: "#4f6356", lineHeight: 1.5, background: "#f8faf8", padding: 10, borderRadius: 8, border: "1px solid #edf2ee" }}>
                        {viewingVendor.description || "Authentic local producer certified for eco-friendly farming practices and direct-to-consumer delivery."}
                      </p>
                    </div>

                    <div>
                      <strong style={{ color: "#2d4436", display: "block", marginBottom: 2 }}>Physical Farm Address:</strong>
                      <p style={{ margin: 0, color: "#4f6356", display: "flex", alignItems: "flex-start", gap: 4 }}>
                        <MapPin size={14} style={{ color: "#168d51", flexShrink: 0, marginTop: 2 }} />
                        <span>{viewingVendor.address || viewingVendor.location || "Kathmandu Valley, Nepal"}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 2: Owner & Compliance */}
                <div className="vendor-card-box">
                  <h4>
                    <ShieldCheck size={15} /> Owner &amp; Compliance Verification
                  </h4>
                  <div style={{ display: "grid", gap: 14, fontSize: 13 }}>
                    <div>
                      <strong style={{ color: "#2d4436", display: "block", marginBottom: 2 }}>Authorized Representative:</strong>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1a2e22" }}>
                        {viewingVendor.first_name} {viewingVendor.last_name}
                      </span>
                    </div>

                    <div>
                      <strong style={{ color: "#2d4436", display: "block", marginBottom: 6 }}>Direct Contact:</strong>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <a href={`tel:${viewingVendor.phone}`} className="vendor-contact-btn">
                          <Phone size={13} /> {viewingVendor.phone}
                        </a>
                        <a href={`mailto:${viewingVendor.email}`} className="vendor-contact-btn">
                          <Mail size={13} /> Email Partner
                        </a>
                      </div>
                    </div>

                    <div>
                      <strong style={{ color: "#2d4436", display: "block", marginBottom: 4 }}>Business Identification:</strong>
                      <div className="vendor-doc-pill">
                        <FileText size={16} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {viewingVendor.document_name || "Business_Registration_Certificate.pdf"}
                          </div>
                          <small style={{ color: "#166534", fontWeight: 500 }}>Verified Identity &amp; PAN Record</small>
                        </div>
                        <ShieldCheck size={16} />
                      </div>
                    </div>

                    <div style={{ background: "#edf8f0", padding: "10px 12px", borderRadius: 8, fontSize: 12, color: "#166534" }}>
                      <strong>Payout Terms:</strong> Standard bi-weekly bank transfer (NPR) with 8% platform marketplace commission.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="ad-modal-foot" style={{ background: "#f8faf8", borderTop: "1px solid #e7eee9", padding: "16px 24px" }}>
              <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#667f70" }}>
                  Status: <strong>{viewingVendor.status.replace("_", " ").toUpperCase()}</strong>
                </span>

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {viewingVendor.status !== "approved" && (
                    <button
                      type="button"
                      className="auth-btn"
                      style={{ width: "auto", background: "#168d51", padding: "8px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
                      disabled={state.busy}
                      onClick={() => updateStatus(viewingVendor, "approved")}
                    >
                      <CheckCircle2 size={15} /> Approve Storefront
                    </button>
                  )}

                  {viewingVendor.status !== "on_hold" && (
                    <button
                      type="button"
                      className="auth-btn"
                      style={{ width: "auto", background: "#f59e0b", padding: "8px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
                      disabled={state.busy}
                      onClick={() => updateStatus(viewingVendor, "on_hold")}
                    >
                      <PauseCircle size={15} /> Put on Hold
                    </button>
                  )}

                  {viewingVendor.status !== "rejected" && (
                    <button
                      type="button"
                      className="auth-btn"
                      style={{ width: "auto", background: "#ef4444", padding: "8px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
                      disabled={state.busy}
                      onClick={() => updateStatus(viewingVendor, "rejected")}
                    >
                      <Ban size={15} /> Reject
                    </button>
                  )}

                  <button
                    type="button"
                    className="auth-btn ghost"
                    style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                    onClick={() => setViewingVendor(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// 5. USERS (AdminUsers)
// ========================================================
export function AdminUsers() {
  const state = useData<AdminUser[]>(api.adminUsers);
  const [params, setParams] = useSearchParams();
  const roleFilter = params.get("role") || "All";
  const search = (params.get("q") || "").trim().toLowerCase();

  const filtered = useMemo(() => {
    return (state.data || []).filter((u) => {
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      const matchSearch =
        !search ||
        u.first_name.toLowerCase().includes(search) ||
        u.last_name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        (u.phone || "").toLowerCase().includes(search) ||
        (u.location || "").toLowerCase().includes(search);
      return matchRole && matchSearch;
    });
  }, [state.data, roleFilter, search]);

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Registered Customers"
        subtitle="Customers, local farm partners and platform administrators."
        refresh={state.load}
        busy={state.busy}
        actions={
          <button
            type="button"
            className="vd-add-btn"
            style={{ background: "#edf8f0", color: "#168d51", border: "1px solid #c2e2cc" }}
            disabled={!filtered.length}
            onClick={() =>
              exportCsv(
                `googledoko-users-${Date.now()}.csv`,
                filtered.map((u) => ({
                  ID: u.id,
                  Name: `${u.first_name} ${u.last_name}`,
                  Email: u.email,
                  Phone: u.phone,
                  Role: u.role,
                  Location: u.location,
                  Verified: u.verified ? "Yes" : "No",
                  Joined: u.created_at,
                })),
              )
            }
          >
            <Download size={15} /> Export Customers
          </button>
        }
      />

      <div className="ad-filter-tabs">
        {["All", "customer", "vendor", "admin"].map((r) => {
          const count = (state.data || []).filter((u) => r === "All" || u.role === r).length;
          return (
            <button
              key={r}
              type="button"
              className={`ad-filter-tab${roleFilter === r ? " active" : ""}`}
              onClick={() => {
                const next = new URLSearchParams(params);
                if (r === "All") next.delete("role");
                else next.set("role", r);
                setParams(next);
              }}
            >
              {r === "All" ? `All (${count})` : `${r.charAt(0).toUpperCase() + r.slice(1)}s (${count})`}
            </button>
          );
        })}
      </div>

      {state.error && <p className="auth-error">{state.error}</p>}

      <div className="vd-table-wrap">
        <table className="vd-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Info</th>
              <th>Role</th>
              <th>Location</th>
              <th>Status</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.first_name} {row.last_name}</strong>
                  <div><small>ID: #{row.id}</small></div>
                </td>
                <td>
                  <div>{row.email}</div>
                  <div style={{ color: "#667f70", fontSize: 12 }}>{row.phone || "No phone"}</div>
                </td>
                <td>
                  <span
                    className={
                      row.role === "admin"
                        ? "ad-badge-danger"
                        : row.role === "vendor"
                          ? "ad-badge-pending"
                          : "ad-badge-success"
                    }
                  >
                    {row.role}
                  </span>
                </td>
                <td>{row.location || "Nepal"}</td>
                <td>
                  <span className={row.verified ? "ad-badge-success" : "ad-badge-pending"}>
                    {row.verified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td>{new Date(row.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "36px 0", color: "#667f70" }}>
                  No users found matching search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========================================================
// 6. SUPPORT INBOX (AdminSupport)
// ========================================================
export function AdminSupport() {
  const state = useData<SupportMessage[]>(api.adminSupport);
  const [params, setParams] = useSearchParams();
  const statusFilter = params.get("status") || "All";
  const search = (params.get("q") || "").trim().toLowerCase();
  const { showToast } = useAccount();

  const filtered = useMemo(() => {
    return (state.data || []).filter((item) => {
      const matchStatus = statusFilter === "All" || item.status === statusFilter;
      const matchSearch =
        !search ||
        item.full_name.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.inquiry.toLowerCase().includes(search) ||
        (item.phone || "").toLowerCase().includes(search);
      return matchStatus && matchSearch;
    });
  }, [state.data, statusFilter, search]);

  async function toggleStatus(ticket: SupportMessage) {
    const next = ticket.status === "Open" ? "Resolved" : "Open";
    await state.mutate(() => api.adminSupportStatus(ticket.id, next));
    showToast(`Ticket #${ticket.id} marked ${next}`);
  }

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Support &amp; Inquiries"
        subtitle="Customer questions, feedback, and vendor assistance requests."
        refresh={state.load}
        busy={state.busy}
      />

      <div className="ad-filter-tabs">
        {["All", "Open", "Resolved"].map((s) => {
          const count = (state.data || []).filter((i) => s === "All" || i.status === s).length;
          return (
            <button
              key={s}
              type="button"
              className={`ad-filter-tab${statusFilter === s ? " active" : ""}`}
              onClick={() => {
                const next = new URLSearchParams(params);
                if (s === "All") next.delete("status");
                else next.set("status", s);
                setParams(next);
              }}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {state.error && <p className="auth-error">{state.error}</p>}

      <div style={{ display: "grid", gap: 16 }}>
        {filtered.map((item) => (
          <article className="vd-card" key={item.id} style={{ borderLeft: item.status === "Open" ? "4px solid #ef4444" : "4px solid #168d51" }}>
            <div className="vd-card-head">
              <div>
                <h2 style={{ fontSize: 16, margin: 0 }}>
                  Ticket #{item.id} · {item.full_name}
                </h2>
                <small style={{ color: "#667f70" }}>
                  Received on {new Date(item.created_at).toLocaleString()}
                </small>
              </div>
              <span className={item.status === "Open" ? "ad-badge-danger" : "ad-badge-success"}>
                {item.status}
              </span>
            </div>

            <div style={{ margin: "12px 0", fontSize: 14, color: "#374151" }}>
              <p style={{ margin: "2px 0" }}>
                <strong>Contact:</strong> {item.email} • {item.phone}
              </p>
              {item.address && (
                <p style={{ margin: "2px 0" }}>
                  <strong>Address:</strong> {item.address}
                </p>
              )}
            </div>

            <blockquote
              style={{
                margin: "12px 0",
                padding: "12px 16px",
                background: "#f9fafb",
                borderRadius: 8,
                borderLeft: "3px solid #cbd5e1",
                fontStyle: "italic",
                color: "#1f2937",
                fontSize: 14,
              }}
            >
              "{item.inquiry}"
            </blockquote>

            <div className="admin-quick-links">
              <a
                className="auth-btn ghost"
                style={{ width: "auto" }}
                href={`mailto:${item.email}?subject=${encodeURIComponent(`GoogleDoko Support Ticket #${item.id}`)}`}
              >
                <Mail size={14} /> Reply by Email
              </a>
              <button
                type="button"
                className="auth-btn"
                style={{
                  width: "auto",
                  background: item.status === "Open" ? "#168d51" : "#f1f5f2",
                  color: item.status === "Open" ? "#ffffff" : "#374151",
                  border: "none",
                }}
                disabled={state.busy}
                onClick={() => toggleStatus(item)}
              >
                {item.status === "Open" ? "Mark Resolved" : "Reopen Ticket"}
              </button>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="vd-card" style={{ textAlign: "center", padding: 40, color: "#667f70" }}>
            No support inquiries found.
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================================
// 7. SUBSCRIBERS (AdminSubscribers)
// ========================================================
export function AdminSubscribers() {
  const state = useData<{ email: string; created_at: string }[]>(api.adminSubscribers);
  const [params, setParams] = useSearchParams();
  const search = (params.get("q") || "").trim().toLowerCase();

  const filtered = useMemo(() => {
    return (state.data || []).filter((s) => !search || s.email.toLowerCase().includes(search));
  }, [state.data, search]);

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Newsletter Subscribers"
        subtitle="Community members opted into receive weekly updates on seasonal harvests and offers."
        refresh={state.load}
        busy={state.busy}
        actions={
          <button
            type="button"
            className="vd-add-btn"
            style={{ background: "#edf8f0", color: "#168d51", border: "1px solid #c2e2cc" }}
            disabled={!filtered.length}
            onClick={() => exportCsv(`googledoko-subscribers-${Date.now()}.csv`, filtered)}
          >
            <Download size={15} /> Export Subscribers
          </button>
        }
      />

      <div className="ad-catalog-card" style={{ padding: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <div className="ad-catalog-search-wrap" style={{ maxWidth: 360 }}>
            <Search size={16} className="ad-catalog-search-icon" />
            <input
              type="search"
              value={params.get("q") || ""}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                if (e.target.value.trim()) next.set("q", e.target.value.trim());
                else next.delete("q");
                setParams(next);
              }}
              placeholder="Search subscribers by email..."
              aria-label="Search subscribers"
            />
            {search && (
              <button
                type="button"
                className="ad-catalog-search-clear"
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.delete("q");
                  setParams(next);
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
            Total Audience: <strong style={{ color: "#168d51" }}>{(state.data || []).length}</strong> emails
          </span>
        </div>
      </div>

      {state.error && <p className="auth-error">{state.error}</p>}

      <div className="vd-table-wrap">
        <table className="vd-table">
          <thead>
            <tr>
              <th>Subscriber Email</th>
              <th>Subscription Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.email}>
                <td>
                  <strong>{s.email}</strong>
                </td>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
                <td>
                  <span className="ad-badge-success">Subscribed</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "36px 0", color: "#667f70" }}>
                  No subscribers recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========================================================
// 8. ADMIN PROFILE (AdminProfile)
// ========================================================
export function AdminProfile() {
  const { user, updateUser, setPhoto, changePassword, showToast } = useAccount();
  const fileRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await updateUser({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
      showToast("Admin profile saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  async function handlePhotoUpload(file?: File | null) {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      await setPhoto(dataUrl);
      showToast("Profile photo updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not upload photo");
    }
  }

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Admin Profile &amp; Security"
        subtitle="Manage administrator credentials, profile avatar, and account access."
      />

      {error && <p className="auth-error" role="alert">{error}</p>}

      {/* Avatar and Basic Details Card */}
      <form className="vd-card auth-form" onSubmit={saveProfile}>
        <h2 style={{ fontSize: 17, margin: "0 0 16px" }}>Administrator Details</h2>

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div
            className="auth-upload-avatar-circle"
            style={{ width: 72, height: 72 }}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            {user.photo ? (
              <img src={user.photo} alt="Admin avatar" />
            ) : (
              <span style={{ fontSize: 24, fontWeight: 800 }}>{user.firstName?.[0] || "A"}</span>
            )}
            <span className="auth-upload-cam-badge" title="Change photo">
              <Camera size={14} />
            </span>
          </div>

          <div>
            <button
              type="button"
              className="vd-add-btn"
              style={{ background: "#edf8f0", color: "#168d51", border: "1px solid #c2e2cc", padding: "6px 14px", fontSize: 13 }}
              onClick={() => fileRef.current?.click()}
            >
              Upload Profile Photo
            </button>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#667f70" }}>
              JPG, PNG or WebP image under 10 MB
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="auth-form-grid">
          <label className="auth-field">
            <span>First Name *</span>
            <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>

          <label className="auth-field">
            <span>Last Name</span>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>

          <label className="auth-field">
            <span>Email Address</span>
            <input readOnly value={user.email} style={{ background: "#f8faf8", cursor: "not-allowed" }} />
          </label>

          <label className="auth-field">
            <span>Phone Number</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" />
          </label>
        </div>

        <button type="submit" className="auth-btn" style={{ width: "auto", marginTop: 14 }} disabled={busy}>
          {busy ? "Saving..." : "Save Profile Details"}
        </button>
      </form>

      {/* Password Change Form */}
      <form
        className="vd-card auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const message = await changePassword(current, next);
          setError(message || "");
          if (!message) {
            setCurrent("");
            setNext("");
            showToast("Password updated successfully");
          }
          setBusy(false);
        }}
      >
        <h2 style={{ fontSize: 17, margin: "0 0 16px" }}>Change Password</h2>

        <AuthPasswordField
          label="Current Password"
          value={current}
          onChange={setCurrent}
          placeholder="Enter current password"
          autoComplete="current-password"
        />

        <AuthPasswordField
          label="New Password"
          value={next}
          onChange={setNext}
          placeholder="At least 8 characters, mix of letters and numbers"
          autoComplete="new-password"
          showStrength
        />

        <button type="submit" className="auth-btn" style={{ width: "auto", marginTop: 14 }} disabled={busy || !current || !next}>
          {busy ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

// ========================================================
// 9. COUPONS & DISCOUNTS (AdminCoupons)
// ========================================================
export function AdminCoupons() {
  const state = useData<AdminCoupon[]>(api.adminCoupons);
  const [params, setParams] = useSearchParams();
  const filter = params.get("status") || "All";
  const search = (params.get("q") || "").trim().toLowerCase();
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useAccount();
  const [submitting, setSubmitting] = useState(false);

  const couponSchema = yup.object({
    code: yup.string().required("Coupon code is required").trim().uppercase(),
    discountType: yup.string().oneOf(["percentage", "fixed"]).default("percentage"),
    discountValue: yup
      .number()
      .typeError("Enter a valid number")
      .required("Discount value is required")
      .positive("Must be greater than 0")
      .when("discountType", {
        is: "percentage",
        then: (s) => s.max(100, "Percentage cannot exceed 100%"),
      }),
    minOrder: yup.number().typeError("Enter a valid number").min(0, "Cannot be negative").default(0),
    expiryDate: yup.string().required("Expiry date is required"),
  });

  type CouponFormData = yup.InferType<typeof couponSchema>;

  const {
    register: registerCoupon,
    handleSubmit: handleCouponSubmit,
    reset: resetCoupon,
    watch: watchCoupon,
    formState: { errors: couponErrors },
  } = useForm<CouponFormData>({
    resolver: yupResolver(couponSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: 10,
      minOrder: 500,
      expiryDate: "2026-12-31",
    },
  });

  const watchDiscountType = watchCoupon("discountType");

  const filtered = useMemo(() => {
    return (state.data || []).filter((c) => {
      const matchStatus =
        filter === "All" ||
        (filter === "active" && c.active === 1) ||
        (filter === "inactive" && c.active === 0);
      const discountType = (c.discount_type || (c as any).discountType || "").toLowerCase();
      const codeStr = (c.code || "").toLowerCase();
      const matchSearch =
        !search ||
        codeStr.includes(search) ||
        discountType.includes(search);
      return matchStatus && matchSearch;
    });
  }, [state.data, filter, search]);

  async function handleToggle(coupon: AdminCoupon) {
    const nextActive = coupon.active ? 0 : 1;
    await state.mutate(() => api.adminToggleCoupon(coupon.id, nextActive));
    showToast(`${coupon.code} is now ${nextActive ? "Active" : "Disabled"}`);
  }

  async function handleDelete(coupon: AdminCoupon) {
    if (!confirm(`Are you sure you want to delete promo coupon ${coupon.code}?`)) return;
    await state.mutate(() => api.adminDeleteCoupon(coupon.id));
    showToast(`Deleted coupon ${coupon.code}`);
  }

  async function onCouponSubmit(data: CouponFormData) {
    setSubmitting(true);
    try {
      await state.mutate(() =>
        api.adminCreateCoupon({
          code: data.code.trim().toUpperCase(),
          discount_type: data.discountType as "percentage" | "fixed",
          discount_value: Number(data.discountValue),
          min_order: Number(data.minOrder),
          expiry_date: data.expiryDate,
        }),
      );
      showToast(`Created promo code ${data.code.toUpperCase()}`);
      setShowModal(false);
      resetCoupon();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Promotional Coupons &amp; Discounts"
        subtitle="Create discount campaigns, manage promo codes, and track customer redemption rates across Nepal."
        refresh={state.load}
        busy={state.busy}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="vd-add-btn"
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} /> Create New Coupon
            </button>
            <button
              type="button"
              className="vd-add-btn"
              style={{ background: "#edf8f0", color: "#168d51", border: "1px solid #c2e2cc" }}
              disabled={!filtered.length}
              onClick={() =>
                exportCsv(
                  `googledoko-coupons-${Date.now()}.csv`,
                  filtered.map((c) => ({
                    ID: c.id,
                    Code: c.code,
                    Type: c.discount_type || (c as any).discountType || "percentage",
                    Value: c.discount_value ?? (c as any).discountValue ?? 0,
                    MinOrder: c.min_order ?? (c as any).minOrder ?? 0,
                    Expiry: c.expiry_date || (c as any).expiryDate || "",
                    TimesUsed: c.times_used ?? (c as any).timesUsed ?? 0,
                    Active: c.active ? "Yes" : "No",
                  })),
                )
              }
            >
              <Download size={15} /> Export
            </button>
          </div>
        }
      />

      <div className="ad-filter-tabs">
        <button
          type="button"
          className={`ad-filter-tab${filter === "All" ? " active" : ""}`}
          onClick={() => {
            const next = new URLSearchParams(params);
            next.delete("status");
            setParams(next);
          }}
        >
          All Codes ({(state.data || []).length})
        </button>
        <button
          type="button"
          className={`ad-filter-tab${filter === "active" ? " active" : ""}`}
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set("status", "active");
            setParams(next);
          }}
        >
          Active ({(state.data || []).filter((c) => c.active === 1).length})
        </button>
        <button
          type="button"
          className={`ad-filter-tab${filter === "inactive" ? " active" : ""}`}
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set("status", "inactive");
            setParams(next);
          }}
        >
          Disabled ({(state.data || []).filter((c) => c.active === 0).length})
        </button>
      </div>

      {state.error && <p className="auth-error">{state.error}</p>}

      <div className="vd-table-wrap">
        <table className="vd-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount Value</th>
              <th>Min Order Requirement</th>
              <th>Redemptions</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((coupon) => {
              const discountType = coupon.discount_type || (coupon as any).discountType || "percentage";
              const discountValue = coupon.discount_value ?? (coupon as any).discountValue ?? 0;
              const minOrder = coupon.min_order ?? (coupon as any).minOrder ?? 0;
              const timesUsed = coupon.times_used ?? (coupon as any).timesUsed ?? 0;
              const expiryDate = coupon.expiry_date || (coupon as any).expiryDate;
              const formattedExpiry =
                expiryDate && !isNaN(new Date(expiryDate).getTime())
                  ? new Date(expiryDate).toLocaleDateString()
                  : expiryDate || "No Expiry";

              return (
                <tr key={coupon.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ background: "#edf8f0", color: "#168d51", padding: "4px 8px", borderRadius: 6, fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>
                        {coupon.code}
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: "#168d51", fontSize: 14 }}>
                      {discountType === "percentage"
                        ? `${discountValue}% OFF`
                        : `Rs. ${discountValue} OFF`}
                    </strong>
                  </td>
                  <td>
                    Rs. {Number(minOrder).toLocaleString()}
                  </td>
                  <td>
                    <strong>{timesUsed}</strong> times
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: "#4b5563" }}>
                      {formattedExpiry}
                    </span>
                  </td>
                  <td>
                    <span className={coupon.active ? "ad-badge-success" : "ad-badge-hold"}>
                      {coupon.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <div className="tbl-action-group">
                      <button
                        type="button"
                        className={`tbl-action-btn ${coupon.active ? "amber" : "green"}`}
                        disabled={state.busy}
                        onClick={() => handleToggle(coupon)}
                      >
                        {coupon.active ? <><Ban size={12} /> Disable</> : <><Check size={12} /> Activate</>}
                      </button>
                      <button
                        type="button"
                        className="tbl-icon-btn red"
                        disabled={state.busy}
                        onClick={() => handleDelete(coupon)}
                        title="Delete coupon"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "36px 0", color: "#667f70" }}>
                  No coupons found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Coupon Modal */}
      {showModal && (
        <div className="ad-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ad-modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-head">
              <h2>Create Promotional Coupon</h2>
              <button type="button" className="vd-icon-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCouponSubmit(onCouponSubmit, getFormErrorScrollHandler())} noValidate>
              <div className="ad-modal-body">
                <div style={{ display: "grid", gap: 14 }}>
                  <label className="auth-field">
                    <span>Coupon Code * (e.g. DASHAIN25, ORGANIC15)</span>
                    <input
                      {...registerCoupon("code")}
                      placeholder="SUMMER20"
                      style={{ textTransform: "uppercase", fontWeight: 700 }}
                    />
                    {couponErrors.code?.message && (
                      <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                        {couponErrors.code.message}
                      </span>
                    )}
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label className="auth-field">
                      <span>Discount Type</span>
                      <select {...registerCoupon("discountType")}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (Rs.)</option>
                      </select>
                    </label>

                    <label className="auth-field">
                      <span>Discount Value *</span>
                      <input
                        type="number"
                        min="1"
                        {...registerCoupon("discountValue")}
                        placeholder={watchDiscountType === "percentage" ? "15" : "150"}
                      />
                      {couponErrors.discountValue?.message && (
                        <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                          {couponErrors.discountValue.message}
                        </span>
                      )}
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label className="auth-field">
                      <span>Minimum Order Amount (Rs.)</span>
                      <input
                        type="number"
                        min="0"
                        {...registerCoupon("minOrder")}
                        placeholder="500"
                      />
                      {couponErrors.minOrder?.message && (
                        <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                          {couponErrors.minOrder.message}
                        </span>
                      )}
                    </label>

                    <label className="auth-field">
                      <span>Expiry Date *</span>
                      <input
                        type="date"
                        {...registerCoupon("expiryDate")}
                      />
                      {couponErrors.expiryDate?.message && (
                        <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                          {couponErrors.expiryDate.message}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <div className="ad-modal-foot">
                <button
                  type="submit"
                  className="auth-btn"
                  style={{ width: "auto" }}
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Save & Activate Coupon"}
                </button>
                <button
                  type="button"
                  className="auth-btn ghost"
                  style={{ width: "auto" }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// 10. MARKETPLACE SETTINGS (AdminSettings)
// ========================================================
const settingsSchema = yup.object({
  delivery_fee: yup.number().typeError("Enter a valid number").min(0, "Cannot be negative").required("Delivery fee is required"),
  free_delivery_threshold: yup.number().typeError("Enter a valid number").min(0, "Cannot be negative").required("Free delivery threshold is required"),
  platform_commission: yup.number().typeError("Enter a valid number").min(0).max(50, "Max commission is 50%").required("Commission is required"),
  support_phone: yup.string().required("Phone is required").trim(),
  support_email: yup.string().required("Email is required").email("Enter a valid email").trim(),
  announcement_banner: yup.string().default("").trim(),
  announcement_active: yup.boolean().default(true),
});

type SettingsFormData = yup.InferType<typeof settingsSchema>;

export function AdminSettings() {
  const state = useData<PlatformSettings>(api.adminSettings);
  const { showToast } = useAccount();
  const [saving, setSaving] = useState(false);

  const {
    register: registerSettings,
    handleSubmit: handleSettingsSubmit,
    reset: resetSettings,
    formState: { errors: settingsErrors },
  } = useForm<SettingsFormData>({
    resolver: yupResolver(settingsSchema),
    defaultValues: {
      delivery_fee: 80,
      free_delivery_threshold: 1500,
      platform_commission: 8,
      support_phone: "+977 9801234567",
      support_email: "support@googledoko.com",
      announcement_banner: "",
      announcement_active: true,
    },
  });

  useEffect(() => {
    if (state.data) {
      resetSettings({
        delivery_fee: state.data.delivery_fee,
        free_delivery_threshold: state.data.free_delivery_threshold,
        platform_commission: state.data.platform_commission,
        support_phone: state.data.support_phone,
        support_email: state.data.support_email,
        announcement_banner: state.data.announcement_banner,
        announcement_active: Boolean(state.data.announcement_active),
      });
    }
  }, [state.data, resetSettings]);

  async function onSaveSettings(data: SettingsFormData) {
    setSaving(true);
    try {
      await state.mutate(() =>
        api.adminUpdateSettings({
          delivery_fee: Number(data.delivery_fee),
          free_delivery_threshold: Number(data.free_delivery_threshold),
          platform_commission: Number(data.platform_commission),
          support_phone: data.support_phone,
          support_email: data.support_email,
          announcement_banner: data.announcement_banner || "",
          announcement_active: Boolean(data.announcement_active),
        }),
      );
      showToast("Marketplace operational settings updated successfully");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="vd-settings">
      <AdminHeader
        title="Marketplace Operational Settings"
        subtitle="Manage logistics rates, delivery thresholds, vendor commission percentages, and site-wide customer banners."
        refresh={state.load}
        busy={state.busy}
      />

      {state.error && <p className="auth-error">{state.error}</p>}

      <form onSubmit={handleSettingsSubmit(onSaveSettings, getFormErrorScrollHandler())} noValidate style={{ display: "grid", gap: 20 }}>
        {/* Logistics & Economics */}
        <div className="vd-card auth-form">
          <h2 style={{ fontSize: 17, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8, color: "#168d51" }}>
            <DollarSign size={20} /> Logistics &amp; Platform Economics
          </h2>
          <div className="auth-form-grid">
            <label className="auth-field">
              <span>Standard Delivery Fee (NPR)</span>
              <input
                type="number"
                min="0"
                {...registerSettings("delivery_fee")}
              />
              {settingsErrors.delivery_fee?.message && (
                <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                  {settingsErrors.delivery_fee.message}
                </span>
              )}
              <small style={{ color: "#667f70", fontSize: 12 }}>
                Default shipping charged to customers per order.
              </small>
            </label>

            <label className="auth-field">
              <span>Free Delivery Spend Threshold (NPR)</span>
              <input
                type="number"
                min="0"
                {...registerSettings("free_delivery_threshold")}
              />
              {settingsErrors.free_delivery_threshold?.message && (
                <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                  {settingsErrors.free_delivery_threshold.message}
                </span>
              )}
              <small style={{ color: "#667f70", fontSize: 12 }}>
                Orders meeting or exceeding this amount receive free delivery.
              </small>
            </label>

            <label className="auth-field">
              <span>Vendor Marketplace Commission (%)</span>
              <input
                type="number"
                min="0"
                max="50"
                {...registerSettings("platform_commission")}
              />
              {settingsErrors.platform_commission?.message && (
                <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                  {settingsErrors.platform_commission.message}
                </span>
              )}
              <small style={{ color: "#667f70", fontSize: 12 }}>
                Platform fee deducted on payout to farm suppliers.
              </small>
            </label>
          </div>
        </div>

        {/* Customer Support Hotlines */}
        <div className="vd-card auth-form">
          <h2 style={{ fontSize: 17, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8, color: "#168d51" }}>
            <Phone size={20} /> Customer Support Contact
          </h2>
          <div className="auth-form-grid">
            <label className="auth-field">
              <span>Customer Care Phone</span>
              <input
                type="tel"
                {...registerSettings("support_phone")}
              />
              {settingsErrors.support_phone?.message && (
                <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                  {settingsErrors.support_phone.message}
                </span>
              )}
            </label>

            <label className="auth-field">
              <span>Customer Support Email</span>
              <input
                type="email"
                {...registerSettings("support_email")}
              />
              {settingsErrors.support_email?.message && (
                <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                  {settingsErrors.support_email.message}
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Site Announcement Banner */}
        <div className="vd-card auth-form">
          <h2 style={{ fontSize: 17, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8, color: "#168d51" }}>
            <Bell size={20} /> Site-Wide Announcement Banner
          </h2>

          <div style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
              <input
                type="checkbox"
                {...registerSettings("announcement_active")}
                style={{ width: 16, height: 16, accentColor: "#168d51" }}
              />
              <strong>Display announcement banner on store header</strong>
            </label>

            <label className="auth-field">
              <span>Announcement Message</span>
              <textarea
                rows={2}
                {...registerSettings("announcement_banner")}
                placeholder="🌾 Fresh harvest from Mustang & Chitwan just arrived! Enjoy free delivery over Rs. 1,500."
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #dce8df",
                  fontSize: 14,
                  resize: "vertical",
                }}
              />
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="auth-btn"
            style={{ width: "auto", padding: "12px 28px", fontSize: 15 }}
            disabled={saving || state.busy}
          >
            {saving ? "Saving Changes..." : "Save Marketplace Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}


// ==========================================
// 12. LIFESTYLE COLLECTIONS MANAGEMENT
// ==========================================
export function AdminLifestyles() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useAccount();

  // Modal form fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formSubcats, setFormSubcats] = useState("");
  const [formOrder, setFormOrder] = useState("0");
  const [formActive, setFormActive] = useState(1);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminLifestyles();
      setCollections(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load lifestyles:", err);
      showToast(err.message || "Failed to load lifestyle collections");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  function openCreateModal() {
    setEditingCol(null);
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormImage("");
    setFormIcon("");
    setFormSubcats("");
    setFormOrder(String(collections.length + 1));
    setFormActive(1);
    setModalOpen(true);
  }

  function openEditModal(col: any) {
    setEditingCol(col);
    setFormName(col.name || "");
    setFormSlug(col.slug || "");
    setFormDesc(col.description || "");
    setFormImage(col.image || "");
    setFormIcon(col.icon || "");
    setFormSubcats(Array.isArray(col.subcategories) ? col.subcategories.join(", ") : "");
    setFormOrder(String(col.displayOrder ?? 0));
    setFormActive(col.isActive ?? 1);
    setModalOpen(true);
  }

  async function handleToggleStatus(col: any) {
    try {
      await api.adminToggleLifestyle(col.id);
      showToast(`Collection "${col.name}" status updated`);
      loadCollections();
    } catch (err: any) {
      showToast(err.message || "Failed to toggle collection status");
    }
  }

  async function handleDelete(col: any) {
    if (!window.confirm(`Are you sure you want to delete "${col.name}"? Products mapped to this collection will have their mapping removed.`)) {
      return;
    }
    try {
      await api.adminDeleteLifestyle(col.id);
      showToast(`Collection "${col.name}" deleted`);
      loadCollections();
    } catch (err: any) {
      showToast(err.message || "Failed to delete collection");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Please enter a collection name");
      return;
    }

    setSaving(true);
    const subcategories = formSubcats
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      description: formDesc.trim(),
      image: formImage.trim(),
      icon: formIcon.trim(),
      subcategories,
      displayOrder: parseInt(formOrder, 10) || 0,
      isActive: formActive,
    };

    try {
      await api.adminSaveLifestyle(editingCol ? editingCol.id : null, payload);
      showToast(editingCol ? "Collection updated successfully" : "Collection created successfully");
      setModalOpen(false);
      loadCollections();
    } catch (err: any) {
      showToast(err.message || "Failed to save collection");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="vd-content-wrap">
      <div className="vd-products-head" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={26} color="#168d51" /> Shop by Lifestyle Collections
          </h1>
          <p>
            Manage public lifestyle collections, featured photography, subcategories, and active statuses.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="vd-add-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={openCreateModal}
          >
            <Plus size={16} /> Add New Collection
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#6b7280" }}>
          Loading lifestyle collections...
        </div>
      ) : collections.length === 0 ? (
        <div className="vd-card" style={{ padding: 48, textAlign: "center" }}>
          <Sparkles size={40} color="#168d51" style={{ margin: "0 auto 12px" }} />
          <h3>No Collections Configured</h3>
          <p style={{ color: "#6b7280", marginBottom: 16 }}>
            Create your first lifestyle collection to feature on the website.
          </p>
          <button type="button" className="vd-add-btn" onClick={openCreateModal}>
            <Plus size={16} /> Create Collection
          </button>
        </div>
      ) : (
        <div className="vd-table-wrap">
          <table className="vd-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Cover</th>
                <th>Collection Name</th>
                <th>Slug</th>
                <th>Subcategories</th>
                <th style={{ textAlign: "center" }}>Products</th>
                <th style={{ textAlign: "center" }}>Order</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => {
                const subcats = col.subcategories || [];
                const isActive = col.isActive === 1;
                return (
                  <tr key={col.id}>
                    <td>
                      <img
                        src={col.image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=100&q=80"}
                        alt={col.name}
                        style={{
                          width: 56,
                          height: 42,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                        }}
                      />
                    </td>
                    <td>
                      <strong style={{ fontSize: 14, color: "#111827", display: "block" }}>
                        {col.name}
                      </strong>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        {col.description ? col.description.slice(0, 60) + (col.description.length > 60 ? "…" : "") : "No description"}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
                        /lifestyle/{col.slug}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 260 }}>
                        {subcats.slice(0, 3).map((sub: string) => (
                          <span
                            key={sub}
                            style={{
                              fontSize: 11,
                              background: "#f0fdf4",
                              color: "#166534",
                              border: "1px solid #bbf7d0",
                              padding: "1px 6px",
                              borderRadius: 6,
                            }}
                          >
                            {sub}
                          </span>
                        ))}
                        {subcats.length > 3 && (
                          <span style={{ fontSize: 11, color: "#6b7280" }}>
                            +{subcats.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600, color: "#065f46" }}>
                      {col.productCount ?? 0}
                    </td>
                    <td style={{ textAlign: "center", color: "#6b7280" }}>
                      {col.displayOrder ?? 0}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: 11.5,
                          fontWeight: 600,
                          background: isActive ? "#dcfce7" : "#fee2e2",
                          color: isActive ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <Link
                          to={`/lifestyle/${col.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="vd-act-btn"
                          title="View on site"
                          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #d1d5db" }}
                        >
                          <Eye size={15} color="#4b5563" />
                        </Link>
                        <button
                          type="button"
                          className="vd-act-btn"
                          title={isActive ? "Hide collection" : "Activate collection"}
                          onClick={() => handleToggleStatus(col)}
                          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #d1d5db" }}
                        >
                          {isActive ? <Ban size={15} color="#d97706" /> : <CheckCircle2 size={15} color="#16a34a" />}
                        </button>
                        <button
                          type="button"
                          className="vd-act-btn"
                          title="Edit collection"
                          onClick={() => openEditModal(col)}
                          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #d1d5db" }}
                        >
                          <Pencil size={15} color="#2563eb" />
                        </button>
                        <button
                          type="button"
                          className="vd-act-btn"
                          title="Delete collection"
                          onClick={() => handleDelete(col)}
                          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #d1d5db" }}
                        >
                          <Trash2 size={15} color="#dc2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              maxWidth: 600,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={20} color="#168d51" />
                {editingCol ? `Edit Collection: ${editingCol.name}` : "Create Lifestyle Collection"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <label className="vd-field">
                <span>Collection Name <i>*</i></span>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Traditional Nepali Crafts, Mountain Living"
                />
              </label>

              <label className="vd-field">
                <span>URL Slug (Optional - auto-generated if blank)</span>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. traditional-crafts"
                />
              </label>

              <label className="vd-field">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Short description summarizing this lifestyle collection..."
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 13.5,
                  }}
                />
              </label>

              <label className="vd-field">
                <span>Hero / Cover Image URL</span>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </label>

              <label className="vd-field">
                <span>Subcategories (Comma-separated)</span>
                <input
                  type="text"
                  value={formSubcats}
                  onChange={(e) => setFormSubcats(e.target.value)}
                  placeholder="e.g. Sofas, Beds, Tables, Chairs, Cabinets"
                />
                <small style={{ color: "#6b7280", marginTop: 4, display: "block" }}>
                  Separate individual subcategories with commas.
                </small>
              </label>

              <div className="vd-grid-2">
                <label className="vd-field">
                  <span>Display Sort Order</span>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    min="0"
                  />
                </label>

                <label className="vd-field">
                  <span>Status</span>
                  <select
                    value={formActive}
                    onChange={(e) => setFormActive(parseInt(e.target.value, 10))}
                  >
                    <option value={1}>Active (Visible)</option>
                    <option value={0}>Hidden (Draft)</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="vd-add-btn"
                  style={{ minWidth: 120 }}
                >
                  {saving ? "Saving..." : editingCol ? "Save Changes" : "Create Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
