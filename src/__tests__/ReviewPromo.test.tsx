import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import PromoCodeSection from "../components/checkout/PromoCodeSection";
import OrderSummaryCard from "../components/OrderSummaryCard";
import ReviewModal from "../components/review/ReviewModal";
import AccountReviews from "../pages/account/AccountReviews";
import { apiSlice } from "../store/api/apiSlice";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { CheckoutProvider } from "../context/CheckoutContext";
import { AccountProvider } from "../context/AccountContext";
import { AuthFlowProvider } from "../context/AuthFlowContext";
import { OrdersProvider } from "../context/OrdersContext";
import { api, setToken, clearToken } from "../api/client";

function renderWithProviders(ui: React.ReactElement, { route = "/" } = {}) {
  const store = configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });

  return render(
    <Provider store={store}>
      <AccountProvider>
        <AuthFlowProvider>
          <OrdersProvider>
            <CartProvider>
              <WishlistProvider>
                <CheckoutProvider>
                  <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
                </CheckoutProvider>
              </WishlistProvider>
            </CartProvider>
          </OrdersProvider>
        </AuthFlowProvider>
      </AccountProvider>
    </Provider>
  );
}

describe("Customer Review System & Unified Promo Code Frontend Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearToken();
    localStorage.clear();
  });

  describe("PromoCodeSection & Checkout Integration", () => {
    it("renders promo code input and allows user to apply a coupon", async () => {
      vi.spyOn(api, "validateCoupon").mockResolvedValue({
        valid: true,
        code: "HARVEST10",
        discountType: "percentage",
        discountValue: 10,
        discountAmount: 50,
        minOrder: 200,
        message: "10% off applied",
      });

      renderWithProviders(<PromoCodeSection />);

      const input = screen.getByPlaceholderText(/enter promo code/i);
      const applyBtn = screen.getByRole("button", { name: /apply/i });

      expect(input).toBeInTheDocument();
      expect(applyBtn).toBeDisabled();

      fireEvent.change(input, { target: { value: "HARVEST10" } });
      expect(applyBtn).not.toBeDisabled();

      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(api.validateCoupon).toHaveBeenCalledWith("HARVEST10", expect.any(Number));
      });
    });

    it("displays error message when promo code validation fails", async () => {
      vi.spyOn(api, "validateCoupon").mockRejectedValue(new Error("Invalid or expired coupon code"));

      renderWithProviders(<PromoCodeSection />);

      const input = screen.getByPlaceholderText(/enter promo code/i);
      const applyBtn = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(input, { target: { value: "INVALIDCODE" } });
      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired coupon code/i)).toBeInTheDocument();
      });
    });

    it("embeds PromoCodeSection inside OrderSummaryCard", () => {
      renderWithProviders(
        <OrderSummaryCard
          items={[{ id: "p1", name: "Apple", price: 100, quantity: 2, image: "/apple.jpg", weight: "1 kg" }]}
          actionLabel="Proceed to Payment"
          onAction={() => {}}
        />
      );

      expect(screen.getByPlaceholderText(/enter promo code/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /apply/i })).toBeInTheDocument();
    });
  });

  describe("ReviewModal Component", () => {
    it("renders form fields, star picker, and validates submission", async () => {
      const submitSpy = vi.spyOn(api, "submitReview").mockResolvedValue({
        id: 101,
        productId: "p-apple-jumla",
        user_id: 1,
        first_name: "Ujala",
        last_name: "Sah",
        rating: 5,
        title: "Crisp and Sweet",
        body: "Best apples I ever tasted from Jumla!",
        verifiedPurchase: true,
        orderId: "GD-1234",
        helpfulCount: 0,
        status: "approved",
        created_at: new Date().toISOString(),
      });

      const handleClose = vi.fn();
      const handleSuccess = vi.fn();

      render(
        <ReviewModal
          isOpen={true}
          onClose={handleClose}
          productId="p-apple-jumla"
          productName="Organic Jumla Apples"
          orderId="GD-1234"
          orderItemId="GD-1234-p-apple-jumla"
          onSuccess={handleSuccess}
        />
      );

      expect(screen.getByText(/write a product review/i)).toBeInTheDocument();
      expect(screen.getByText(/organic jumla apples/i)).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText(/how was the quality/i);
      const titleInput = screen.getByPlaceholderText(/crisp, sweet/i);
      const submitBtn = screen.getByRole("button", { name: /submit review/i });

      fireEvent.change(titleInput, { target: { value: "Crisp and Sweet" } });
      fireEvent.change(textarea, { target: { value: "Best apples I ever tasted from Jumla!" } });
      expect(submitBtn).not.toBeDisabled();
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledWith({
          productId: "p-apple-jumla",
          rating: 5,
          title: "Crisp and Sweet",
          body: "Best apples I ever tasted from Jumla!",
          orderId: "GD-1234",
          orderItemId: "GD-1234-p-apple-jumla",
        });
        expect(screen.getByText(/thank you! your verified review has been saved/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe("AccountReviews Page", () => {
    it("fetches and renders real reviews with status and seller response", async () => {
      vi.spyOn(api, "getMyReviews").mockResolvedValue([
        {
          id: 42,
          productId: "p-honey",
          productName: "Wild Cliff Honey",
          productImage: "/honey.jpg",
          orderId: "GD-9999",
          rating: 5,
          title: "Pure and medicinal",
          body: "Authentic Himalayan cliff honey with distinct floral notes.",
          status: "approved",
          helpfulCount: 8,
          images: [],
          reply: "Thank you for supporting our beekeepers in Lamjung!",
          replyAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);

      setToken("test-token", true);

      renderWithProviders(<AccountReviews />);

      await waitFor(() => {
        expect(screen.getByText(/wild cliff honey/i)).toBeInTheDocument();
        expect(screen.getByText(/pure and medicinal/i)).toBeInTheDocument();
        expect(screen.getByText(/authentic himalayan cliff honey/i)).toBeInTheDocument();
        expect(screen.getByText(/approved/i)).toBeInTheDocument();
        expect(screen.getByText(/seller response/i)).toBeInTheDocument();
        expect(screen.getByText(/thank you for supporting our beekeepers/i)).toBeInTheDocument();
      });
    });
  });
});
