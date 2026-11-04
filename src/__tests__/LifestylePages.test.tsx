import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import Navbar from "../components/layout/Navbar";
import LifestyleLanding from "../pages/lifestyle/LifestyleLanding";
import LifestyleCollectionPage from "../pages/lifestyle/LifestyleCollectionPage";
import { apiSlice } from "../store/api/apiSlice";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { CheckoutProvider } from "../context/CheckoutContext";
import { AccountProvider } from "../context/AccountContext";
import { AuthFlowProvider } from "../context/AuthFlowContext";
import { api } from "../api/client";

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
          <CartProvider>
            <WishlistProvider>
              <CheckoutProvider>
                <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
              </CheckoutProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthFlowProvider>
      </AccountProvider>
    </Provider>
  );
}

describe("Shop by Lifestyle Frontend Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders 'Shop by Lifestyle' in the header navigation", async () => {
    renderWithProviders(<Navbar />);
    expect(screen.getAllByText("Shop by Lifestyle").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Lifestyle landing page with signature collections", async () => {
    renderWithProviders(<LifestyleLanding />, { route: "/lifestyle" });

    // Check header and titles
    expect(screen.getByText("Shop By Lifestyle")).toBeInTheDocument();
    expect(screen.getByText("Signature Lifestyle Collections")).toBeInTheDocument();

    // Verify key collection names
    expect(screen.getByText("Furniture")).toBeInTheDocument();
    expect(screen.getByText("Home & Living")).toBeInTheDocument();
    expect(screen.getByText("Kitchen & Dining")).toBeInTheDocument();
    expect(screen.getByText("Garden & Outdoor")).toBeInTheDocument();
    expect(screen.getByText("Beauty & Personal Care")).toBeInTheDocument();
    expect(screen.getByText("Fashion & Accessories")).toBeInTheDocument();
  });

  it("renders an individual lifestyle collection page with subcategories, search, and products", async () => {
    const mockCollection = {
      id: "lifestyle-furniture",
      name: "Furniture",
      slug: "furniture",
      description: "Handcrafted wooden furniture and seating",
      image: "https://example.com/furniture.jpg",
      icon: "furniture",
      subcategories: ["Sofas", "Beds", "Tables", "Chairs"],
      displayOrder: 1,
      isActive: 1,
      productCount: 1,
    };

    const mockProductsResponse = {
      collection: mockCollection,
      products: [
        {
          id: "PROD-FURN-01",
          name: "Handcrafted Sisau Dining Table",
          price: 32500,
          weight: "35 kg",
          rating: 4.9,
          sold: "14",
          origin: "Bhaktapur, Nepal",
          seller: "Newa Woodcrafts",
          stock: 8,
          active: 1,
          image: "/table.jpg",
          subcategory: "Tables",
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
      subcategories: ["Sofas", "Beds", "Tables", "Chairs"],
    };

    vi.spyOn(api, "lifestyleProducts").mockResolvedValue(mockProductsResponse as any);

    renderWithProviders(
      <Routes>
        <Route path="/lifestyle/:slug" element={<LifestyleCollectionPage />} />
      </Routes>,
      { route: "/lifestyle/furniture" }
    );

    // Verify loading and loaded elements
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Furniture" })).toBeInTheDocument();
      expect(screen.getByText("Handcrafted wooden furniture and seating")).toBeInTheDocument();
      expect(screen.getByText("All Furniture")).toBeInTheDocument();
      expect(screen.getByText("Sofas")).toBeInTheDocument();
      expect(screen.getByText("Tables")).toBeInTheDocument();
      expect(screen.getByText("Handcrafted Sisau Dining Table")).toBeInTheDocument();
      expect(screen.getByText("Rs 32,500")).toBeInTheDocument();
    });
  });
});
