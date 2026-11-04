import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ProductCard from "../components/product/ProductCard";
import CartItem from "../components/cart/CartItem";
import { apiSlice } from "../store/api/apiSlice";
import { CartProvider } from "../context/CartContext";
import { CheckoutProvider } from "../context/CheckoutContext";
import { WishlistProvider } from "../context/WishlistContext";
import { AccountProvider } from "../context/AccountContext";
import { AuthFlowProvider } from "../context/AuthFlowContext";
import {
  resolveProductSellingUnit,
  formatPricePerUnit,
  formatQuantityWithUnit,
  getAllowedUnitsForCategory,
} from "../utils/productUnits";

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

describe("Category-Aware Product Selling Units & Pricing System Tests", () => {
  describe("Unit resolution and price formatting", () => {
    it("resolves piece/set for furniture and avoids kg/litre", () => {
      expect(resolveProductSellingUnit("Furniture", "piece")).toBe("piece");
      expect(resolveProductSellingUnit("Furniture", "set")).toBe("set");
      // Even if legacy weight was '35 kg', category is Furniture so it resolves to piece
      expect(resolveProductSellingUnit("Furniture", undefined, "35 kg")).toBe("piece");
    });

    it("resolves pair for shoes and piece for clothing", () => {
      expect(resolveProductSellingUnit("Shoes", "pair")).toBe("pair");
      expect(resolveProductSellingUnit("Fashion & Accessories", undefined, "pair")).toBe("pair");
      expect(resolveProductSellingUnit("Clothing", "piece")).toBe("piece");
    });

    it("resolves grocery units (kg, litre, dozen, bunch) correctly", () => {
      expect(resolveProductSellingUnit("Fruits", "kg")).toBe("kg");
      expect(resolveProductSellingUnit("Fruits", undefined, "1 kg")).toBe("kg");
      expect(resolveProductSellingUnit("Dairy & Eggs", undefined, "1 litre")).toBe("litre");
      expect(resolveProductSellingUnit("Dairy & Eggs", undefined, "1 dozen")).toBe("dozen");
      expect(resolveProductSellingUnit("Vegetables", undefined, "1 bunch")).toBe("bunch");
    });

    it("formats price per unit cleanly without misleading units", () => {
      expect(formatPricePerUnit(3500, "piece", "Furniture")).toBe("Rs. 3,500 / piece");
      expect(formatPricePerUnit(12000, "set", "Furniture")).toBe("Rs. 12,000 / set");
      expect(formatPricePerUnit(2500, "pair", "Shoes")).toBe("Rs. 2,500 / pair");
      expect(formatPricePerUnit(800, "piece", "Clothing")).toBe("Rs. 800 / piece");
      expect(formatPricePerUnit(180, "kg", "Fruits")).toBe("Rs. 180 / kg");
      expect(formatPricePerUnit(100, "litre", "Dairy & Eggs")).toBe("Rs. 100 / litre");
    });

    it("formats shopping quantity with correct pluralization and units", () => {
      expect(formatQuantityWithUnit(1, "piece")).toBe("1 piece");
      expect(formatQuantityWithUnit(2, "piece")).toBe("2 pieces");
      expect(formatQuantityWithUnit(1, "set")).toBe("1 set");
      expect(formatQuantityWithUnit(2, "set")).toBe("2 sets");
      expect(formatQuantityWithUnit(1, "pair")).toBe("1 pair");
      expect(formatQuantityWithUnit(2, "pair")).toBe("2 pairs");
      expect(formatQuantityWithUnit(2, "kg")).toBe("2 kg");
      expect(formatQuantityWithUnit(1.5, "kg")).toBe("1.5 kg");
    });

    it("filters allowed selling units strictly per category", () => {
      const furnitureUnits = getAllowedUnitsForCategory("Furniture");
      expect(furnitureUnits).toContain("piece");
      expect(furnitureUnits).toContain("set");
      expect(furnitureUnits).not.toContain("kg");
      expect(furnitureUnits).not.toContain("litre");

      const fruitUnits = getAllowedUnitsForCategory("Fruits");
      expect(fruitUnits).toContain("kg");
      expect(fruitUnits).toContain("gram");
    });
  });

  describe("UI Component Rendering with Selling Units", () => {
    it("renders ProductCard with correct '/ piece' label for a furniture product", () => {
      const furnitureProduct = {
        id: "PROD-FURN-01",
        name: "Handcrafted Wooden Chair",
        category: "Furniture",
        price: 3500,
        sellingUnit: "piece",
        weight: "7 kg (Net Weight)",
        rating: 4.8,
        sold: "12",
        origin: "Bhaktapur, Nepal",
        seller: "Newa Woodcrafts",
        image: "/test.jpg",
        gallery: ["/test.jpg"],
      };

      renderWithProviders(
        <ProductCard product={furnitureProduct as any} />
      );

      expect(screen.getByText("Handcrafted Wooden Chair")).toBeInTheDocument();
      // Should show / piece, NEVER /kg
      expect(screen.getByText("/ piece")).toBeInTheDocument();
      expect(screen.queryByText("/kg")).not.toBeInTheDocument();
    });

    it("renders CartItem with dynamic selling unit instead of generic weight", () => {
      const cartItem = {
        id: "PROD-FASH-01",
        name: "Running Shoes",
        category: "Fashion & Accessories",
        sellingUnit: "pair",
        weight: "750 g",
        price: 2500,
        quantity: 2,
        image: "/shoes.jpg",
      };

      renderWithProviders(
        <CartItem item={cartItem as any} />
      );

      expect(screen.getByText("Running Shoes")).toBeInTheDocument();
      expect(screen.getByText(/Rs\. 2,500 \/ pair/)).toBeInTheDocument();
      expect(screen.queryByText(/\/kg/)).not.toBeInTheDocument();
    });
  });
});
