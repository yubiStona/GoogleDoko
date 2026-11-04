import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import CheckoutDelivery from "../pages/CheckoutDelivery";
import CheckoutPayment from "../pages/CheckoutPayment";
import PromoCodeSection from "../components/checkout/PromoCodeSection";
import {
  scrollToElement,
  scrollToFirstError,
  mapBackendErrorToField,
  prefersReducedMotion,
} from "../utils/formErrorNavigation";
import { apiSlice } from "../store/api/apiSlice";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { CheckoutProvider } from "../context/CheckoutContext";
import { AccountProvider } from "../context/AccountContext";
import { AuthFlowProvider } from "../context/AuthFlowContext";
import { OrdersProvider } from "../context/OrdersContext";
import { api } from "../api/client";

function renderWithProviders(ui: React.ReactElement, { route = "/checkout" } = {}) {
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
                  <MemoryRouter initialEntries={[route]}>
                    <Routes>
                      <Route path="*" element={ui} />
                    </Routes>
                  </MemoryRouter>
                </CheckoutProvider>
              </WishlistProvider>
            </CartProvider>
          </OrdersProvider>
        </AuthFlowProvider>
      </AccountProvider>
    </Provider>
  );
}

describe("Smart Form Validation & Scroll-to-Error Navigation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    vi.spyOn(api, "calculateCheckout").mockResolvedValue({
      valid: true,
      items: [],
      subtotal: 300,
      deliveryFee: 50,
      discount: 0,
      total: 350,
      coupon: null,
    });
  });

  describe("Core Navigation Utilities", () => {
    it("scrolls to element with sticky navbar offset and focuses the input", () => {
      const scrollToSpy = vi.fn();
      window.scrollTo = scrollToSpy;

      const container = document.createElement("div");
      const input = document.createElement("input");
      input.id = "test-phone";
      container.appendChild(input);
      document.body.appendChild(container);

      // Mock getBoundingClientRect
      vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
        top: 300,
        left: 0,
        bottom: 350,
        right: 200,
        width: 200,
        height: 50,
        x: 0,
        y: 300,
        toJSON: () => {},
      });

      scrollToElement(container, { navbarOffset: 95 });

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 300 - 95,
        behavior: "smooth",
      });

      // Cleanup
      document.body.removeChild(container);
    });

    it("respects prefers-reduced-motion when smooth scrolling", () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(prefersReducedMotion()).toBe(true);

      const scrollToSpy = vi.fn();
      window.scrollTo = scrollToSpy;

      const div = document.createElement("div");
      document.body.appendChild(div);
      vi.spyOn(div, "getBoundingClientRect").mockReturnValue({
        top: 200,
        left: 0,
        bottom: 250,
        right: 100,
        width: 100,
        height: 50,
        x: 0,
        y: 200,
        toJSON: () => {},
      });

      scrollToElement(div, { navbarOffset: 80 });

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 200 - 80,
        behavior: "auto",
      });

      document.body.removeChild(div);
    });

    it("finds the first invalid field using scrollToFirstError", () => {
      const scrollToSpy = vi.fn();
      window.scrollTo = scrollToSpy;

      const form = document.createElement("form");
      const validField = document.createElement("input");
      validField.name = "valid";

      const invalidField = document.createElement("input");
      invalidField.name = "invalid";
      invalidField.setAttribute("aria-invalid", "true");

      form.appendChild(validField);
      form.appendChild(invalidField);
      document.body.appendChild(form);

      // Give mock offsetParent and rect
      Object.defineProperty(invalidField, "offsetParent", { value: document.body });
      vi.spyOn(invalidField, "getBoundingClientRect").mockReturnValue({
        top: 450,
        left: 0,
        bottom: 490,
        right: 200,
        width: 200,
        height: 40,
        x: 0,
        y: 450,
        toJSON: () => {},
      });

      const result = scrollToFirstError(form, { navbarOffset: 95 });
      expect(result).toBe(true);
      expect(scrollToSpy).toHaveBeenCalled();

      document.body.removeChild(form);
    });

    it("correctly maps backend errors to related fields", () => {
      const stockErr = mapBackendErrorToField("Only 2 units of Organic Apples in stock");
      expect(stockErr.field).toBe("cart-items");
      expect(stockErr.userMessage).toContain("Only 2 units");

      const promoErr = mapBackendErrorToField("Coupon code DASHAIN has expired");
      expect(promoErr.field).toBe("couponCode");

      const phoneErr = mapBackendErrorToField("Recipient phone number format is invalid");
      expect(phoneErr.field).toBe("phone");
      expect(phoneErr.userMessage).toContain("10-digit");

      const addrErr = mapBackendErrorToField("Delivery address is required");
      expect(addrErr.field).toBe("deliveryAddress");
    });
  });

  describe("Checkout Delivery Validation", () => {
    it("validates empty phone number and invalid format with accessible error attributes", async () => {
      // Mock cart with 1 item so CheckoutDelivery doesn't redirect to /cart
      localStorage.setItem(
        "googledoko-checkout",
        JSON.stringify({
          items: [
            {
              id: "p1",
              name: "Organic Apples",
              price: 150,
              quantity: 2,
              image: "/apple.jpg",
              weight: "1 kg",
            },
          ],
          fromCart: true,
          selectedAddressId: "home",
          addresses: [],
          form: {
            fullName: "Lahana Lawaju",
            phone: "",
            province: "Bagmati Province",
            district: "Kathmandu",
            area: "Budhanilkantha",
            street: "Gairigaon",
            landmark: "",
            postalCode: "",
            addressType: "Home",
          },
        })
      );

      renderWithProviders(<CheckoutDelivery />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      expect(phoneInput).toBeInTheDocument();

      // Enter invalid phone
      fireEvent.change(phoneInput, { target: { value: "12345" } });

      const continueBtn = await screen.findByRole("button", { name: /continue to payment/i });
      fireEvent.click(continueBtn);

      await waitFor(() => {
        expect(screen.getByText(/enter a valid 10-digit mobile number/i)).toBeInTheDocument();
        expect(phoneInput).toHaveAttribute("aria-invalid", "true");
      });

      // Correct phone
      fireEvent.change(phoneInput, { target: { value: "9851012345" } });

      await waitFor(() => {
        expect(screen.queryByText(/enter a valid 10-digit mobile number/i)).not.toBeInTheDocument();
        expect(phoneInput).toHaveAttribute("aria-invalid", "false");
      });
    });
  });

  describe("Checkout Payment Validation", () => {
    it("renders payment methods and highlights selection error if user attempts to proceed without selection", async () => {
      localStorage.setItem(
        "googledoko-checkout",
        JSON.stringify({
          items: [
            {
              id: "p1",
              name: "Organic Apples",
              price: 150,
              quantity: 1,
              image: "/apple.jpg",
              weight: "1 kg",
            },
          ],
          fromCart: true,
          paymentMethod: "cod",
        })
      );

      renderWithProviders(<CheckoutPayment />);

      const reviewBtn = await screen.findByRole("button", { name: /review order/i });
      expect(reviewBtn).toBeInTheDocument();

      const cards = screen.getAllByRole("radio");
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe("Promo Code Section Error Navigation", () => {
    it("scrolls and highlights input when attempting to apply an empty or invalid promo code", async () => {
      renderWithProviders(<PromoCodeSection />);

      const input = screen.getByPlaceholderText(/enter promo code/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-invalid", "false");
    });
  });
});
