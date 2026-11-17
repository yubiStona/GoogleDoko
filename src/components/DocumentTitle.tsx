import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

import { products } from "../data/products";

const BRAND = "GoogleDoko";

function titleFromParts(parts: string[]) {
  return [...parts.filter(Boolean), BRAND].join(" | ");
}

export function pageTitle(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  const category = params.get("category")?.trim() || "";
  const place = params.get("place")?.trim() || "";
  const query = params.get("q")?.trim() || "";

  const productMatch = pathname.match(/^\/product\/([^/]+)/);
  const orderTrackMatch = pathname.match(/^\/orders\/([^/]+)\/track$/);
  const orderMatch = pathname.match(/^\/orders\/([^/]+)$/);

  if (pathname === "/") {
    return titleFromParts(["Landing"]);
  }

  if (pathname === "/food" || pathname === "/home") {
    return titleFromParts(["Home"]);
  }

  if (pathname === "/categories") {
    if (place && category && category !== "All") {
      return titleFromParts(["Categories", "Place", place, "Products", category]);
    }
    if (place) {
      return titleFromParts(["Categories", "Place", place]);
    }
    if (category && category !== "All") {
      return titleFromParts(["Categories", "Products", category]);
    }
    return titleFromParts(["Categories", "Products"]);
  }

  if (pathname === "/places") {
    return titleFromParts(["Categories", "Place"]);
  }

  if (pathname === "/shop") {
    return titleFromParts(["Shop", "Products"]);
  }

  if (productMatch) {
    const product = products.find((item) => item.id === productMatch[1]);
    return titleFromParts(["Products", product?.name ?? "Details"]);
  }

  if (pathname === "/orders") {
    return titleFromParts(["Order"]);
  }

  if (orderTrackMatch) {
    return titleFromParts(["Order", "Tracking", orderTrackMatch[1]]);
  }

  if (orderMatch) {
    return titleFromParts(["Order", "Details", orderMatch[1]]);
  }

  if (pathname === "/cart") {
    return titleFromParts(["Cart"]);
  }

  if (pathname === "/checkout") {
    return titleFromParts(["Checkout", "Delivery"]);
  }

  if (pathname === "/checkout/payment") {
    return titleFromParts(["Checkout", "Payment"]);
  }

  if (pathname === "/checkout/review") {
    return titleFromParts(["Checkout", "Review"]);
  }

  if (pathname === "/checkout/confirmation") {
    return titleFromParts(["Checkout", "Confirmation"]);
  }

  if (pathname === "/about") {
    return titleFromParts(["About Us"]);
  }

  if (pathname === "/wishlist") {
    return titleFromParts(["Wishlist"]);
  }

  if (pathname === "/account/profile") {
    return titleFromParts(["Account", "Personal Information"]);
  }

  if (pathname.startsWith("/account/orders/")) {
    const id = pathname.split("/")[3];
    return titleFromParts(["Account", "Order", id]);
  }

  if (pathname === "/account/orders") {
    return titleFromParts(["Account", "Orders"]);
  }

  if (pathname === "/account/wishlist") {
    return titleFromParts(["Account", "Wishlist"]);
  }

  if (pathname === "/account/addresses") {
    return titleFromParts(["Account", "Addresses"]);
  }

  if (pathname === "/account/reviews") {
    return titleFromParts(["Account", "Reviews"]);
  }

  if (pathname === "/account/rewards") {
    return titleFromParts(["Account", "Rewards"]);
  }

  if (pathname === "/account") {
    return titleFromParts(["Account"]);
  }

  if (pathname === "/login") {
    return titleFromParts(["Login"]);
  }

  if (pathname === "/signup") {
    return titleFromParts(["Sign Up"]);
  }

  if (pathname === "/signup/customer") {
    return titleFromParts(["Sign Up", "Customer"]);
  }

  if (pathname === "/signup/vendor/status") {
    return titleFromParts(["Vendor", "Account Created"]);
  }

  if (pathname === "/signup/vendor") {
    return titleFromParts(["Sign Up", "Vendor"]);
  }

  if (pathname === "/forgot-password") {
    return titleFromParts(["Forgot Password"]);
  }

  if (pathname.startsWith("/admin")) {
    const page = pathname.replace("/admin", "").replace(/^\//, "") || "Overview";
    const labels: Record<string, string> = {
      "": "Overview",
      users: "Users",
      vendors: "Vendors",
      orders: "Orders",
      products: "Products",
    };
    return titleFromParts(["Admin", labels[page] || "Overview"]);
  }

  if (pathname.startsWith("/vendor")) {
    const page = pathname.replace("/vendor", "").replace(/^\//, "") || "Dashboard";
    const labels: Record<string, string> = {
      "": "Dashboard",
      products: "Products",
      "products/new": "Add Product",
      orders: "Orders",
      customers: "Customers",
      sales: "Sales",
      reports: "Reports",
      analytics: "Reports",
      reviews: "Reviews",
      profile: "Store Profile",
      settings: "Settings",
    };
    return titleFromParts(["Vendor", labels[page] || "Dashboard"]);
  }

  if (pathname === "/search") {
    return titleFromParts(query ? ["Search", query] : ["Search"]);
  }

  if (pathname === "/support") {
    return titleFromParts(["Support"]);
  }

  if (pathname === "/delivery") {
    return titleFromParts(["Delivery"]);
  }

  return titleFromParts(["Page Not Found"]);
}

function DocumentTitle() {
  const { pathname, search } = useLocation();
  const title = pageTitle(pathname, search);

  useLayoutEffect(() => {
    document.title = title;

    const titleEl = document.querySelector("title");
    if (titleEl) {
      titleEl.textContent = title;
    }
  }, [title]);

  return <title>{title}</title>;
}

export default DocumentTitle;
