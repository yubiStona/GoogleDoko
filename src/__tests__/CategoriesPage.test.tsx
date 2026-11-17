import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import CategoriesPage from "../pages/CategoriesPage";
import { apiSlice } from "../store/api/apiSlice";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { CheckoutProvider } from "../context/CheckoutContext";
import { AccountProvider } from "../context/AccountContext";
import { AuthFlowProvider } from "../context/AuthFlowContext";

function renderCategoriesPage() {
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
                <MemoryRouter initialEntries={["/categories"]}>
                  <CategoriesPage />
                </MemoryRouter>
              </CheckoutProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthFlowProvider>
      </AccountProvider>
    </Provider>
  );
}

describe("CategoriesPage - Shop by Products Food-Only Focus", () => {
  it("renders food categories and excludes lifestyle categories from filters", () => {
    renderCategoriesPage();

    // Must show "All Products" and default food categories
    expect(screen.getByRole("heading", { name: "All Products" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fruits" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vegetables" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dairy & Eggs" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Spices" })).toBeInTheDocument();

    // Must NOT show lifestyle category buttons
    expect(screen.queryByRole("button", { name: "Beauty & Personal Care" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Fashion & Accessories" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Furniture" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Garden & Outdoor" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Home & Living" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kitchen & Dining" })).not.toBeInTheDocument();
  });
});
