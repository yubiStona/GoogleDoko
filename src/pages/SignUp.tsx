import { ShoppingBag, Store } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";

import AuthShell from "../components/auth/AuthShell";
import { postLoginPath, useAccount } from "../context/AccountContext";
import { adminVendorPortalUrl } from "../utils/adminVendorPortal";

function SignUp() {
  const { isLoggedIn, user } = useAccount();
  const from = (useLocation().state as { from?: string } | null)?.from;

  if (isLoggedIn) {
    return <Navigate to={postLoginPath(user.role, from)} replace />;
  }

  return (
    <AuthShell wide>
      <div className="auth-intro">
        <h1>Create your GoogleDoko account</h1>
        <p>
          Join GoogleDoko to discover and shop authentic products from different
          places across Nepal.
        </p>
      </div>

      <h2 className="auth-choose-title">How would you like to join?</h2>

      <div className="auth-role-grid">
        <article className="auth-role-card customer">
          <div className="auth-role-icon" aria-hidden="true">
            <ShoppingBag size={28} strokeWidth={1.7} />
          </div>
          <h3>Sign up as a Customer</h3>
          <p>
            Discover local products, explore their origins and shop from trusted
            sellers.
          </p>
          <ul>
            <li>Explore products by place</li>
            <li>Add products to your cart</li>
            <li>Track your orders</li>
            <li>Save your favourite products</li>
          </ul>
          <Link to="/signup/customer" state={{ from }} className="auth-btn">
            Continue as Customer
          </Link>
        </article>

        <article className="auth-role-card vendor">
          <div className="auth-role-icon" aria-hidden="true">
            <Store size={28} strokeWidth={1.7} />
          </div>
          <h3>Sign up as a Vendor</h3>
          <p>Sell your local products and reach customers across Nepal.</p>
          <ul>
            <li>Add and manage products</li>
            <li>Set prices and stock</li>
            <li>Add product origin</li>
            <li>Manage your orders</li>
          </ul>
          <a href={adminVendorPortalUrl("/signup/vendor")} className="auth-btn vendor">
            Continue as Vendor
          </a>
        </article>
      </div>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}

export default SignUp;
