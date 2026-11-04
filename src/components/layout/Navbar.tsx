import {
  Search,
  Heart,
  UserRound,
  ShoppingCart,
  ChevronDown,
  MapPin,
  Menu,
  X,
  CircleHelp,
  House,
  LayoutGrid,
  LayoutDashboard,
  Compass,
  Package,
  Sparkles,
} from "lucide-react";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { searchPlaces, searchProducts } from "../../data/search";
import { useAccount } from "../../context/AccountContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import LogoMark from "../LogoMark";
import MobileBottomNav from "../MobileBottomNav";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems } = useCart();
  const { isLoggedIn, user, logout } = useAccount();
  const userPhoto = user.photo || "";
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [userPhoto]);

  const accountHref =
    isLoggedIn && user.role === "admin"
      ? "/admin"
      : isLoggedIn && user.role === "vendor"
        ? "/vendor"
        : "/account";
  const [accountOpen, setAccountOpen] = useState(false);
  const { wishlist } = useWishlist();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchWrapRef = useRef<HTMLFormElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCategoriesEnter = () => {
    if (categoriesTimeoutRef.current) {
      clearTimeout(categoriesTimeoutRef.current);
      categoriesTimeoutRef.current = null;
    }
    setCategoriesOpen(true);
  };

  const handleCategoriesLeave = () => {
    if (categoriesTimeoutRef.current) {
      clearTimeout(categoriesTimeoutRef.current);
    }
    categoriesTimeoutRef.current = setTimeout(() => {
      setCategoriesOpen(false);
    }, 220);
  };

  const categoriesActive =
    location.pathname.startsWith("/categories") ||
    location.pathname.startsWith("/places") ||
    location.pathname.startsWith("/lifestyle");

  useEffect(() => {
    if (location.pathname === "/search") {
      setQuery(searchParams.get("q") ?? "");
    }
  }, [location.pathname, searchParams]);

  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.add("has-site-nav");
    return () => document.body.classList.remove("has-site-nav");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", menuOpen);
    return () => document.body.classList.remove("nav-menu-open");
  }, [menuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(target)
      ) {
        setSuggestionsOpen(false);
      }
      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(target)
      ) {
        setCategoriesOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (categoriesTimeoutRef.current) {
        clearTimeout(categoriesTimeoutRef.current);
      }
    };
  }, []);

  const productSuggestions = useMemo(
    () => searchProducts(query).slice(0, 5),
    [query],
  );
  const placeSuggestions = useMemo(
    () => searchPlaces(query).slice(0, 4),
    [query],
  );
  const showSuggestions =
    suggestionsOpen &&
    query.trim().length > 0 &&
    (productSuggestions.length > 0 || placeSuggestions.length > 0);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      return;
    }

    setSuggestionsOpen(false);
    setMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function closeMenu() {
    setMenuOpen(false);
    setCategoriesOpen(false);
  }

  const suggestionList = showSuggestions ? (
    <div className="search-suggestions">
      {placeSuggestions.length > 0 && (
        <div className="search-suggestion-group">
          <p>Places</p>
          {placeSuggestions.map((place) => (
            <Link
              key={place.origin}
              to={`/categories?place=${encodeURIComponent(place.origin)}`}
              onClick={() => {
                setSuggestionsOpen(false);
                closeMenu();
              }}
            >
              <MapPin size={16} />
              <span>
                {place.name}
                <small>{place.origin}</small>
              </span>
            </Link>
          ))}
        </div>
      )}

      {productSuggestions.length > 0 && (
        <div className="search-suggestion-group">
          <p>Products</p>
          {productSuggestions.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              onClick={() => {
                setSuggestionsOpen(false);
                closeMenu();
              }}
            >
              <img src={product.image} alt="" />
              <span>
                {product.name}
                <small>{product.origin}</small>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <nav className="navbar">
        <div className={`navbar-container${menuOpen ? " menu-open" : ""}`}>
          <Link to="/" className="logo">
            <LogoMark className="logo-icon" decorative />
            <div className="logo-text-group">
              <span className="logo-brand">GoogleDoko</span>
              <span className="logo-tagline">Fresh &amp; Organic Nepal</span>
            </div>
          </Link>

          <div className="nav-links" id="site-nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-home-link ${isActive ? "active" : ""}`}
            >
              Home
            </NavLink>

            <div
              ref={categoriesDropdownRef}
              className={`nav-dropdown ${categoriesOpen ? "open" : ""}`}
              onMouseEnter={handleCategoriesEnter}
              onMouseLeave={handleCategoriesLeave}
            >
              <button
                type="button"
                className={`category-link ${categoriesActive ? "active" : ""}`}
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
                onClick={() => {
                  if (categoriesTimeoutRef.current) {
                    clearTimeout(categoriesTimeoutRef.current);
                  }
                  setCategoriesOpen((open) => !open);
                }}
              >
                Categories
                <ChevronDown
                  size={14}
                  className={`category-chevron ${categoriesOpen ? "open" : ""}`}
                />
              </button>

              <div
                className="nav-dropdown-menu"
                onMouseEnter={handleCategoriesEnter}
                onMouseLeave={handleCategoriesLeave}
              >
                <div className="nav-dropdown-panel">
                  <NavLink
                    to="/categories"
                    className={({ isActive }) => (isActive ? "active" : "")}
                    onClick={() => {
                      setCategoriesOpen(false);
                      if (categoriesTimeoutRef.current) {
                        clearTimeout(categoriesTimeoutRef.current);
                      }
                    }}
                  >
                    <LayoutGrid size={16} className="nav-dropdown-item-icon" />
                    <span>Shop by Product</span>
                  </NavLink>
                  <NavLink
                    to="/places"
                    className={({ isActive }) => (isActive ? "active" : "")}
                    onClick={() => {
                      setCategoriesOpen(false);
                      if (categoriesTimeoutRef.current) {
                        clearTimeout(categoriesTimeoutRef.current);
                      }
                    }}
                  >
                    <MapPin size={16} className="nav-dropdown-item-icon" />
                    <span>Shop by Place</span>
                  </NavLink>
                  <NavLink
                    to="/lifestyle"
                    className={({ isActive }) => (isActive ? "active" : "")}
                    onClick={() => {
                      setCategoriesOpen(false);
                      if (categoriesTimeoutRef.current) {
                        clearTimeout(categoriesTimeoutRef.current);
                      }
                    }}
                  >
                    <Sparkles size={16} className="nav-dropdown-item-icon" />
                    <span>Shop by Lifestyle</span>
                  </NavLink>
                </div>
              </div>
            </div>

            <NavLink
              to="/orders"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Orders
            </NavLink>
          </div>

          <form
            className="search-wrap"
            ref={searchWrapRef}
            onSubmit={submitSearch}
            role="search"
          >
            <div className="search-container">
              <Search size={17} className="search-leading-icon" />
              <input
                type="search"
                value={query}
                placeholder="Search fresh vegetables, fruits, dairy, or places..."
                aria-label="Search products or places"
                autoComplete="off"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSuggestionsOpen(true);
                }}
                onFocus={() => setSuggestionsOpen(true)}
              />

              <button type="submit" aria-label="Search">
                <Search size={16} />
              </button>
            </div>
            {suggestionList}
          </form>

          <div className="nav-actions">
            <Link
              to="/wishlist"
              className={`nav-action ${location.pathname === "/wishlist" ? "active" : ""}`}
              aria-label={
                isLoggedIn && wishlistCount > 0
                  ? `Wishlist, ${wishlistCount} saved ${wishlistCount === 1 ? "product" : "products"}`
                  : "Wishlist"
              }
            >
              <span className="nav-action-icon">
                <Heart size={20} />
                {isLoggedIn && wishlistCount > 0 && (
                  <span className="nav-count-badge">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </span>
              <span>Wishlist</span>
            </Link>

            <Link
              to="/cart"
              className={`nav-action ${location.pathname === "/cart" ? "active" : ""}`}
              aria-label={
                isLoggedIn && cartCount > 0
                  ? `Cart, ${cartCount} ${cartCount === 1 ? "product" : "products"}`
                  : "Cart"
              }
            >
              <span className="nav-action-icon">
                <ShoppingCart size={20} />
                {isLoggedIn && cartCount > 0 && (
                  <span className="nav-count-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>
              <span>Cart</span>
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to={accountHref}
                  className={`header-dashboard-btn ${location.pathname.startsWith("/account") || location.pathname.startsWith("/vendor") || location.pathname.startsWith("/admin") ? "active" : ""}`}
                  title={user.role === "admin" ? "Admin Dashboard" : user.role === "vendor" ? "Vendor Dashboard" : "My Account"}
                  aria-label="Dashboard"
                >
                  <LayoutDashboard size={15} />
                  <span>
                    {user.role === "admin" ? "Admin Panel" : user.role === "vendor" ? "Vendor Hub" : "Dashboard"}
                  </span>
                  {user.role && user.role !== "customer" && (
                    <span className="hdb-role-pill">{user.role}</span>
                  )}
                </Link>

                <div className={`nav-account-wrap ${accountOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="nav-profile-chip"
                    aria-expanded={accountOpen}
                    onClick={() => setAccountOpen((open) => !open)}
                  >
                    <span className="header-avatar">
                      {userPhoto && !imageError ? (
                        <img
                          src={userPhoto}
                          alt={user.firstName || "Profile"}
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        user.firstName?.[0]?.toUpperCase() || <UserRound size={16} />
                      )}
                    </span>
                    <span className="nav-profile-name">{user.firstName || "Account"}</span>
                    <ChevronDown size={13} className={`nav-profile-chevron${accountOpen ? " open" : ""}`} />
                  </button>
                  {accountOpen ? (
                    <div className="nav-account-menu">
                      <Link to={accountHref} onClick={() => setAccountOpen(false)}>
                        {user.role === "admin" ? "Admin Dashboard" : user.role === "vendor" ? "Vendor Dashboard" : "My Account"}
                      </Link>
                      <Link to="/account/orders" onClick={() => setAccountOpen(false)}>
                        My Orders
                      </Link>
                      <Link to="/wishlist" onClick={() => setAccountOpen(false)}>
                        Wishlist
                      </Link>
                      <Link to="/account/addresses" onClick={() => setAccountOpen(false)}>
                        Addresses
                      </Link>
                      <Link to="/account/profile" onClick={() => setAccountOpen(false)}>
                        Personal Information
                      </Link>
                      <Link to="/account" onClick={() => setAccountOpen(false)}>
                        Account Settings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          logout();
                          navigate("/");
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="nav-auth-links">
                <Link to="/login" className="nav-login-btn">
                  Login
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            className="nav-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={`mobile-nav-overlay${menuOpen ? " open" : ""}`}
          aria-hidden="true"
          onClick={closeMenu}
        />

        <div
          className={`mobile-nav-drawer${menuOpen ? " open" : ""}`}
          id="mobile-nav-drawer"
          aria-hidden={!menuOpen}
        >
          <div className="mobile-nav-drawer-head">
            <span>Menu</span>
            <button
              type="button"
              className="nav-icon-button"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <X size={22} />
            </button>
          </div>
          <NavLink to="/" end onClick={closeMenu}>
            <House size={18} />
            Home
          </NavLink>
          <NavLink to="/categories" onClick={closeMenu}>
            <LayoutGrid size={18} />
            Shop by Product
          </NavLink>
          <NavLink to="/places" onClick={closeMenu}>
            <Compass size={18} />
            Shop by Place
          </NavLink>
          <NavLink to="/lifestyle" onClick={closeMenu}>
            <Sparkles size={18} />
            Shop by Lifestyle
          </NavLink>
          <NavLink to="/orders" onClick={closeMenu}>
            <Package size={18} />
            Orders
          </NavLink>
          <NavLink to="/wishlist" onClick={closeMenu}>
            <Heart size={18} />
            Wishlist
          </NavLink>
          {isLoggedIn ? (
            <>
              <NavLink to={accountHref} onClick={closeMenu}>
                <LayoutDashboard size={18} />
                Dashboard
              </NavLink>
              <NavLink to="/account/profile" onClick={closeMenu}>
                <UserRound size={18} />
                Account Profile
              </NavLink>
              <button
                type="button"
                className="mobile-nav-logout"
                onClick={() => {
                  closeMenu();
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                <UserRound size={18} />
                Account
              </NavLink>
              <NavLink to="/login" className="nav-login-btn" onClick={closeMenu}>
                Login
              </NavLink>
            </>
          )}
          <NavLink to="/support" onClick={closeMenu}>
            <CircleHelp size={18} />
            Help & Support
          </NavLink>
        </div>
      </nav>
      <MobileBottomNav />
    </>
  );
}

export default Navbar;
