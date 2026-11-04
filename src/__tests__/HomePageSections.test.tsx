import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import Home from "../pages/Home";
import { apiSlice } from "../store/api/apiSlice";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { CheckoutProvider } from "../context/CheckoutContext";
import { AccountProvider } from "../context/AccountContext";
import { AuthFlowProvider } from "../context/AuthFlowContext";

function renderHomeWithProviders() {
  const testStore = configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });

  return render(
    <Provider store={testStore}>
      <AccountProvider>
        <AuthFlowProvider>
          <CartProvider>
            <WishlistProvider>
              <CheckoutProvider>
                <MemoryRouter initialEntries={["/"]}>
                  <Home />
                </MemoryRouter>
              </CheckoutProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthFlowProvider>
      </AccountProvider>
    </Provider>
  );
}

describe("Home Page Sections: Shop by Local Areas & Shop by Lifestyle", () => {
  it("renders 'Shop by Local Areas' after 'Special Offers'", () => {
    const { container } = renderHomeWithProviders();

    const localAreasHeading = screen.getByRole("heading", { name: "Shop by Local Areas" });
    expect(localAreasHeading).toBeInTheDocument();

    // Check key places rendered
    expect(screen.getByText("Ilam")).toBeInTheDocument();
    expect(screen.getByText("Mustang")).toBeInTheDocument();
    expect(screen.getByText("Bhaktapur")).toBeInTheDocument();
    expect(screen.getByText("Chitwan")).toBeInTheDocument();

    // Verify ordering in DOM: special offers -> local areas
    const specialOffersSection = container.querySelector(".offers-section");
    const localAreasSection = container.querySelector(".shop-by-local-areas-section");
    expect(specialOffersSection).toBeTruthy();
    expect(localAreasSection).toBeTruthy();

    const isAfterOffers =
      specialOffersSection!.compareDocumentPosition(localAreasSection!) &
      Node.DOCUMENT_POSITION_FOLLOWING;
    expect(isAfterOffers).toBeTruthy();
  });

  it("renders 'Shop by Lifestyle' after 'Shop by Local Areas'", () => {
    const { container } = renderHomeWithProviders();

    const lifestyleHeading = screen.getByRole("heading", { name: /Shop by Lifestyle/i });
    expect(lifestyleHeading).toBeInTheDocument();

    // Check lifestyle categories
    expect(screen.getByText("Furniture")).toBeInTheDocument();
    expect(screen.getByText("Home & Living")).toBeInTheDocument();
    expect(screen.getByText("Kitchen & Dining")).toBeInTheDocument();
    expect(screen.getByText("Fashion & Accessories")).toBeInTheDocument();

    // Verify ordering in DOM: local areas -> lifestyle
    const localAreasSection = container.querySelector(".shop-by-local-areas-section");
    const lifestyleSection = container.querySelector(".shop-by-lifestyle-section");
    expect(localAreasSection).toBeTruthy();
    expect(lifestyleSection).toBeTruthy();

    const isAfterLocalAreas =
      localAreasSection!.compareDocumentPosition(lifestyleSection!) &
      Node.DOCUMENT_POSITION_FOLLOWING;
    expect(isAfterLocalAreas).toBeTruthy();
  });
});
