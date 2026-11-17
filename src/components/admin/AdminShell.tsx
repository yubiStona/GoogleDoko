import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Shield,
  Store,
  Users,
  Mail,
  CircleHelp,
  UserRound,
  Tag,
  Settings,
  X,
  Star,
} from "lucide-react";

import { useAccount } from "../../context/AccountContext";
import LogoMark from "../LogoMark";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/products", label: "Catalog", icon: Package },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/vendors", label: "Vendors & Farms", icon: Store },
  { to: "/admin/users", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons & Discounts", icon: Tag },
  { to: "/admin/support", label: "Support Inbox", icon: CircleHelp },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { to: "/admin/settings", label: "Marketplace Settings", icon: Settings },
  { to: "/admin/profile", label: "Admin Profile", icon: UserRound },
];

function AdminAvatar({ photo, name }: { photo?: string; name?: string }) {
  const [error, setError] = useState(false);
  const initial = name?.[0]?.toUpperCase() || "A";

  useEffect(() => {
    setError(false);
  }, [photo]);

  if (photo && !error) {
    return <img src={photo} alt={name || "Admin"} onError={() => setError(true)} />;
  }

  return <span>{initial}</span>;
}

import AdminLogin from "../../pages/admin/AdminLogin";

function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  if (!isLoggedIn || user.role !== "admin") {
    return <AdminLogin />;
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
            onClick={() => setMenuOpen(false)}
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
          logout();
          navigate("/login");
        }}
      >
        <LogOut size={18} strokeWidth={1.9} />
        Logout
      </button>
    </nav>
  );

  return (
    <div className="vd-app ad-app">
      <aside className={`vd-sidebar${menuOpen ? " open" : ""}`}>
        <div className="vd-brand">
          <LogoMark className="vd-logo" decorative />
          <div>
            <strong>GoogleDoko</strong>
            <span className="ad-badge">ADMIN</span>
          </div>
          <button
            type="button"
            className="vd-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        {nav}
        <div className="vd-help">
          <Shield size={18} />
          <strong>Platform control</strong>
          <p>Approve vendors, watch orders, and keep the marketplace healthy.</p>
        </div>
      </aside>

      {menuOpen ? (
        <button
          type="button"
          className="vd-overlay"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
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
              const cur = location.pathname;
              const path = cur.startsWith("/admin/") && cur !== "/admin"
                ? cur
                : "/admin/products";
              navigate(q ? `${path}?q=${encodeURIComponent(q)}` : path);
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, orders, vendors, customers..."
              aria-label="Search admin dashboard"
            />
            <button type="submit" aria-label="Search">
              <Search size={16} />
            </button>
          </form>
          <div className="vd-top-right">
            <div className="vd-user">
              <NavLink to="/admin/profile" className="vd-avatar" aria-label="My profile">
                <AdminAvatar photo={user.photo} name={user.firstName} />
              </NavLink>
              <div>
                <strong>{user.firstName} {user.lastName}</strong>
                <small>Marketplace admin</small>
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

export default AdminShell;
