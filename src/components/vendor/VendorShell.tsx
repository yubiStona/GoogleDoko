import { useState } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Star,
  Store,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { useAccount } from "../../context/AccountContext";
import LogoMark from "../LogoMark";

const vendorNotifications = [
  { id: "n1", text: "3 new incoming orders need review.", to: "/vendor/orders" },
  { id: "n2", text: "Honey stock is down to 40 jars.", to: "/vendor/products" },
  { id: "n3", text: "Arjun Karki left a 5-star review on honey.", to: "/vendor/reviews" },
];

const links = [
  { to: "/vendor", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/vendor/products", label: "Products", icon: Package, end: true },
  { to: "/vendor/products/new", label: "Add Product", icon: Plus },
  { to: "/vendor/orders", label: "Orders", icon: ClipboardList },
  { to: "/vendor/customers", label: "Customers", icon: Users },
  { to: "/vendor/sales", label: "Sales", icon: TrendingUp },
  { to: "/vendor/reviews", label: "Reviews", icon: Star },
  { to: "/vendor/reports", label: "Reports", icon: BarChart3 },
  { to: "/vendor/profile", label: "Store Profile", icon: Store },
  { to: "/vendor/settings", label: "Settings", icon: Settings },
];

function VendorShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout, showToast } = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const unreadCount = vendorNotifications.length;
  const vendorName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.vendor?.businessName ||
    "Vendor";
  const farm = user.vendor?.businessName || vendorName;
  const avatarLetter = (vendorName || farm || "V").slice(0, 1).toUpperCase();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: "/vendor", role: "vendor" }} />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role !== "vendor") {
    return <Navigate to="/account" replace />;
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const nav = (
    <nav className="vd-nav">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            <Icon size={18} strokeWidth={1.9} />
            {link.label}
          </NavLink>
        );
      })}
      <button
        type="button"
        className="vd-logout"
        onClick={() => {
          closeMenu();
          logout();
          navigate("/login", { state: { role: "vendor", from: "/vendor" } });
        }}
      >
        <LogOut size={18} strokeWidth={1.9} />
        Logout
      </button>
    </nav>
  );

  return (
    <div className="vd-app">
      <aside className={`vd-sidebar${menuOpen ? " open" : ""}`}>
        <div className="vd-brand">
          <LogoMark className="vd-logo" decorative />
          <div>
            <strong>GoogleDoko</strong>
            <span>VENDOR</span>
          </div>
          <button
            type="button"
            className="vd-close"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X size={18} />
          </button>
        </div>
        {nav}
        <div className="vd-help">
          <Headphones size={18} />
          <strong>Need Assistance?</strong>
          <p>Our vendor support team is ready to assist Himalayan farms.</p>
          <a href="mailto:support@googledoko.com">Contact Support</a>
        </div>
      </aside>

      {menuOpen ? (
        <button
          type="button"
          className="vd-overlay"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      ) : null}

      <div className="vd-main">
        <header className="vd-top">
          <button
            type="button"
            className="vd-menu"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
          <form
            className="vd-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const q = search.trim();
              if (!q) {
                showToast("Type something to search");
                return;
              }
              if (location.pathname.startsWith("/vendor/customers")) {
                navigate(`/vendor/customers?q=${encodeURIComponent(q)}`);
              } else if (location.pathname.startsWith("/vendor/sales")) {
                navigate(`/vendor/sales?q=${encodeURIComponent(q)}`);
              } else if (location.pathname.startsWith("/vendor/reviews")) {
                navigate(`/vendor/reviews?q=${encodeURIComponent(q)}`);
              } else if (location.pathname.startsWith("/vendor/settings")) {
                showToast(`Looking up “${q}” in store settings`);
              } else if (location.pathname.startsWith("/vendor/orders")) {
                showToast(`Searching orders for “${q}”`);
              } else if (location.pathname.startsWith("/vendor/reports")) {
                showToast(`Searching reports for “${q}”`);
              } else {
                navigate(`/vendor/products?q=${encodeURIComponent(q)}`);
              }
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                location.pathname === "/vendor/products/new"
                  ? "Creating a new fresh product entry..."
                  : location.pathname.startsWith("/vendor/products")
                    ? "Search your product list..."
                    : location.pathname.startsWith("/vendor/orders")
                      ? "Search your customer orders..."
                      : location.pathname.startsWith("/vendor/customers")
                        ? "Search your customer list..."
                      : location.pathname.startsWith("/vendor/sales")
                        ? "Search sales, payouts, or order IDs..."
                        : location.pathname.startsWith("/vendor/reviews")
                          ? "Search reviews, products, or customers..."
                        : location.pathname.startsWith("/vendor/settings")
                          ? "Search alerts, payments, or account settings..."
                        : location.pathname.startsWith("/vendor/profile")
                        ? "Editing your public farm storefront profile..."
                        : location.pathname.startsWith("/vendor/reports") ||
                            location.pathname.startsWith("/vendor/analytics")
                          ? "Search reports, revenue, or transactions..."
                          : "Search orders, clients, or produce..."
              }
              aria-label="Search vendor dashboard"
            />
            <button type="submit" aria-label="Search">
              <Search size={16} />
            </button>
          </form>
          <div className="vd-top-right">
            <div className="vd-bell-wrap">
              <button
                type="button"
                className="vd-bell"
                aria-label={`${unreadCount} notifications`}
                aria-expanded={notesOpen}
                onClick={() => setNotesOpen((open) => !open)}
              >
                <Bell size={18} />
                {unreadCount > 0 ? <span className="vd-bell-count">{unreadCount}</span> : null}
              </button>
              {notesOpen ? (
                <div className="vd-notes" role="menu">
                  <strong>Notifications ({unreadCount})</strong>
                  {vendorNotifications.map((note) => (
                    <button
                      type="button"
                      className="vd-note-item"
                      key={note.id}
                      onClick={() => {
                        setNotesOpen(false);
                        navigate(note.to);
                      }}
                    >
                      {note.text}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="vd-user">
              <span className="vd-avatar" aria-hidden="true">
                {user.photo || user.vendor?.photo ? (
                  <img src={user.photo || user.vendor?.photo} alt="" />
                ) : (
                  avatarLetter
                )}
              </span>
              <div>
                <strong>{vendorName}</strong>
                <small>{farm && farm.toLowerCase() !== vendorName.toLowerCase() ? `${farm} · Verified Seller` : "Verified Local Seller"}</small>
              </div>
            </div>
          </div>
        </header>
        <div className="vd-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default VendorShell;
