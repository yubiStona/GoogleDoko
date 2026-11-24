import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import DocumentTitle from "./components/DocumentTitle";
import CartToast from "./components/CartToast";

import { CartProvider } from "./context/CartContext";
import { OrdersProvider } from "./context/OrdersContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CheckoutProvider } from "./context/CheckoutContext";
import { AccountProvider } from "./context/AccountContext";
import { AuthFlowProvider } from "./context/AuthFlowContext";

import LandingPage from "./pages/LandingPage";
import LifestyleComingSoon from "./pages/LifestyleComingSoon";
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
import PublishedContentPage from "./pages/PublishedContentPage";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import AccountProfile from "./pages/account/AccountProfile";
import AccountOrders from "./pages/account/AccountOrders";
import AccountOrderDetail from "./pages/account/AccountOrderDetail";
import AccountWishlist from "./pages/account/AccountWishlist";
import AccountAddresses from "./pages/account/AccountAddresses";
import AccountReviews from "./pages/account/AccountReviews";
import AccountRewards from "./pages/account/AccountRewards";
import CustomerLoginEntry from "./pages/CustomerLoginEntry";
import SignUp from "./pages/SignUp";
import SignUpCustomer from "./pages/SignUpCustomer";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
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
import AdminVendorPortalRedirect from "./components/AdminVendorPortalRedirect";

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
          <Route path="/" element={<LandingPage />} />
          <Route path="/food" element={<Home />} />
          <Route path="/home" element={<Home />} />
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
          <Route path="/lifestyle-coming-soon" element={<LifestyleComingSoon />} />
          <Route path="/lifestyle/:slug" element={<LifestyleCollectionPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/pages/:slug" element={<PublishedContentPage />} />
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
        <Route path="/login" element={<CustomerLoginEntry />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/customer" element={<SignUpCustomer />} />
        <Route path="/signup/vendor/*" element={<AdminVendorPortalRedirect />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login/vendor" element={<AdminVendorPortalRedirect />} />
        <Route path="/vendor/*" element={<AdminVendorPortalRedirect />} />
        <Route path="/admin/*" element={<AdminVendorPortalRedirect />} />
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
