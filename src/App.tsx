import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import DocumentTitle from "./components/DocumentTitle";
import CartToast from "./components/CartToast";

import { CartProvider } from "./context/CartContext";
import { OrdersProvider } from "./context/OrdersContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CheckoutProvider } from "./context/CheckoutContext";
import { AccountProvider } from "./context/AccountContext";
import { AuthFlowProvider } from "./context/AuthFlowContext";

import Home from "./pages/Home";
import CategoriesPage from "./pages/CategoriesPage";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Shop from "./pages/Shop";
import LocalPlaces from "./pages/LocalPlaces";
import PlaceDetailPage from "./pages/places/PlaceDetailPage";
import LifestyleLanding from "./pages/lifestyle/LifestyleLanding";
import LifestyleCollectionPage from "./pages/lifestyle/LifestyleCollectionPage";
import ProductDetail from "./pages/ProductDetail";
import OrderDetail from "./pages/OrderDetail";
import Support from "./pages/Support";
import DeliveryInfo from "./pages/DeliveryInfo";
import About from "./pages/About";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import AccountProfile from "./pages/account/AccountProfile";
import AccountOrders from "./pages/account/AccountOrders";
import AccountOrderDetail from "./pages/account/AccountOrderDetail";
import AccountWishlist from "./pages/account/AccountWishlist";
import AccountAddresses from "./pages/account/AccountAddresses";
import AccountReviews from "./pages/account/AccountReviews";
import AccountRewards from "./pages/account/AccountRewards";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import SignUpCustomer from "./pages/SignUpCustomer";
import SignUpVendor from "./pages/SignUpVendor";
import VendorSignupStatus from "./pages/VendorSignupStatus";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/admin/AdminLogin";
import Search from "./pages/Search";
import CheckoutDelivery from "./pages/CheckoutDelivery";
import CheckoutPayment from "./pages/CheckoutPayment";
import CheckoutReview from "./pages/CheckoutReview";
import CheckoutConfirmation from "./pages/CheckoutConfirmation";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPrompt from "./components/auth/AuthPrompt";
import PendingActionHandler from "./components/auth/PendingActionHandler";
import BlockVendor from "./components/vendor/BlockVendor";
import VendorShell from "./components/vendor/VendorShell";
import VendorHome from "./pages/vendor/VendorHome";
import AdminShell from "./components/admin/AdminShell";
import {
  AdminSupport,
  AdminSubscribers,
  AdminProfile,
  AdminHome,
  AdminOrders,
  AdminProducts,
  AdminReviews,
  AdminUsers,
  AdminVendors,
  AdminCoupons,
  AdminSettings,
  AdminLifestyles,
} from "./pages/admin/AdminPages";
import {
  VendorAddProduct,
  VendorAnalytics,
  VendorCustomers,
  VendorOrders,
  VendorProducts,
  VendorProfile,
  VendorReports,
  VendorReviews,
  VendorSales,
  VendorSettings,
} from "./pages/vendor/VendorPages";

function App() {
  return (
    <CartProvider>
    <OrdersProvider>
    <WishlistProvider>
    <CheckoutProvider>
    <AccountProvider>
    <BrowserRouter>
      <AuthFlowProvider>
      <ScrollToTop />
      <DocumentTitle />
      <CartToast />
      <AuthPrompt />
      <PendingActionHandler />
      <Routes>
        <Route element={<BlockVendor />}>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute intent="orders">
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id/track"
            element={
              <ProtectedRoute intent="orders">
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute intent="orders">
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/support" element={<Support />} />
          <Route path="/delivery" element={<DeliveryInfo />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute intent="cart-page">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute intent="checkout">
                <CheckoutDelivery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/payment"
            element={
              <ProtectedRoute intent="checkout">
                <CheckoutPayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/review"
            element={
              <ProtectedRoute intent="checkout">
                <CheckoutReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/confirmation"
            element={
              <ProtectedRoute intent="checkout">
                <CheckoutConfirmation />
              </ProtectedRoute>
            }
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/places" element={<LocalPlaces />} />
          <Route path="/places/:slug" element={<PlaceDetailPage />} />
          <Route path="/lifestyle" element={<LifestyleLanding />} />
          <Route path="/lifestyle/:slug" element={<LifestyleCollectionPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute intent="wishlist-page">
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/profile"
            element={
              <ProtectedRoute>
                <AccountProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/orders"
            element={
              <ProtectedRoute>
                <AccountOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/orders/:orderId"
            element={
              <ProtectedRoute>
                <AccountOrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/wishlist"
            element={
              <ProtectedRoute>
                <AccountWishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/addresses"
            element={
              <ProtectedRoute>
                <AccountAddresses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/reviews"
            element={
              <ProtectedRoute>
                <AccountReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/rewards"
            element={
              <ProtectedRoute>
                <AccountRewards />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/customer" element={<SignUpCustomer />} />
        <Route path="/signup/vendor" element={<SignUpVendor />} />
        <Route path="/signup/vendor/status" element={<VendorSignupStatus />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/vendor/login" element={<Navigate to="/login" replace state={{ role: "vendor", from: "/vendor" }} />} />
        <Route path="/login/vendor" element={<Navigate to="/login" replace state={{ role: "vendor", from: "/vendor" }} />} />

        <Route path="/vendor" element={<VendorShell />}>
          <Route index element={<VendorHome />} />
          <Route path="products/new" element={<VendorAddProduct />} />
          <Route path="products/:id/edit" element={<VendorAddProduct />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="customers" element={<VendorCustomers />} />
          <Route path="sales" element={<VendorSales />} />
          <Route path="reports" element={<VendorReports />} />
          <Route path="analytics" element={<VendorAnalytics />} />
          <Route path="reviews" element={<VendorReviews />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="settings" element={<VendorSettings />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<AdminHome />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="lifestyles" element={<AdminLifestyles />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      </AuthFlowProvider>
    </BrowserRouter>
    </AccountProvider>
    </CheckoutProvider>
    </WishlistProvider>
    </OrdersProvider>
    </CartProvider>
  );
}

export default App;
