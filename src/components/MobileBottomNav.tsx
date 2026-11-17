import { House, LayoutGrid, Package, ShoppingCart, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAccount } from "../context/AccountContext";
import { useCart } from "../context/CartContext";

function MobileBottomNav() {
  const { isLoggedIn, user } = useAccount();
  const { cartItems } = useCart();
  const accountHref =
    isLoggedIn && user.role === "admin"
      ? "/admin"
      : isLoggedIn && user.role === "vendor"
        ? "/vendor"
        : "/account";
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary mobile">
      <NavLink to="/food" end>
        <House size={22} strokeWidth={1.8} />
        Home
      </NavLink>
      <NavLink to="/categories">
        <LayoutGrid size={22} strokeWidth={1.8} />
        Categories
      </NavLink>
      <NavLink to="/orders">
        <Package size={22} strokeWidth={1.8} />
        Orders
      </NavLink>
      <NavLink
        to="/cart"
        className="mobile-bottom-cart"
        aria-label={
          isLoggedIn && cartCount > 0
            ? `Cart, ${cartCount} ${cartCount === 1 ? "product" : "products"}`
            : "Cart"
        }
      >
        <span className="nav-action-icon">
          <ShoppingCart size={22} strokeWidth={1.8} />
          {isLoggedIn && cartCount > 0 ? (
            <span className="nav-count-badge">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          ) : null}
        </span>
        Cart
      </NavLink>
      <NavLink to={isLoggedIn ? accountHref : "/login"}>
        <UserRound size={22} strokeWidth={1.8} />
        Account
      </NavLink>
    </nav>
  );
}

export default MobileBottomNav;
