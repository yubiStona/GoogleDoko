import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import LocalPlaces from "../pages/LocalPlaces";
import PlaceDetailPage from "../pages/places/PlaceDetailPage";
import * as apiSliceHooks from "../store/api/apiSlice";
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

describe("Explore by Places - Frontend Integration Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders LocalPlaces with place cards pointing to /places/:slug", async () => {
    vi.spyOn(apiSliceHooks, "useGetPlacesQuery").mockReturnValue({
      data: [
        {
          id: "bhaktapur",
          name: "Bhaktapur",
          origin: "Bhaktapur, Nepal",
          description: "Famed for traditional agro-produce and sweet curd",
          image: "/src/assets/images/places/bhaktapur.jpg",
          itemCount: 8,
          soldCount: 42,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithProviders(<LocalPlaces />, { route: "/places" });

    await waitFor(() => {
      expect(screen.getByText("All Places")).toBeInTheDocument();
    });

    const bhaktapurLinks = screen.getAllByRole("link").filter((a) =>
      a.getAttribute("href")?.includes("/places/bhaktapur")
    );
    expect(bhaktapurLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders PlaceDetailPage with breadcrumbs, verified description, dynamic categories, popular items, and product grid", async () => {
    const mockPlace = {
      id: "bhaktapur",
      name: "Bhaktapur",
      origin: "Bhaktapur, Nepal",
      description: "Famed for traditional agro-produce, sweet cured curd (Juju Dhau), fresh organic clay-soil vegetables, and heritage spices.",
      image: "/src/assets/images/places/bhaktapur.jpg",
      itemCount: 4,
      soldCount: 30,
      activeCategoriesCount: 2,
    };

    const mockCategories = [
      { id: "curd-dairy", name: "Curd & Dairy", productCount: 2 },
      { id: "vegetables", name: "Vegetables", productCount: 2 },
    ];

    const mockPopularProducts = [
      {
        id: "prod-juju-dhau",
        name: "Authentic Juju Dhau Curd",
        category: "Curd & Dairy",
        price: 180,
        rating: 4.9,
        sold: "25+ sold",
        origin: "Bhaktapur, Nepal",
        seller: "Bhaktapur Dairy",
        image: "/images/juju.jpg",
        stock: 50,
      },
    ];

    const mockProductsResponse = {
      products: [
        {
          id: "prod-juju-dhau",
          name: "Authentic Juju Dhau Curd",
          category: "Curd & Dairy",
          price: 180,
          rating: 4.9,
          sold: "25+ sold",
          origin: "Bhaktapur, Nepal",
          seller: "Bhaktapur Dairy",
          image: "/images/juju.jpg",
          stock: 50,
        },
        {
          id: "prod-clay-radish",
          name: "Bhaktapur Red Radish",
          category: "Vegetables",
          price: 90,
          rating: 4.7,
          sold: "5+ sold",
          origin: "Bhaktapur, Nepal",
          seller: "Bhaktapur Organic Farms",
          image: "/images/radish.jpg",
          stock: 40,
        },
      ],
      total: 2,
      page: 1,
      limit: 12,
      totalPages: 1,
    };

    vi.spyOn(api, "placeBySlug").mockResolvedValue(mockPlace);
    vi.spyOn(api, "placeCategories").mockResolvedValue(mockCategories);
    vi.spyOn(api, "placePopularProducts").mockResolvedValue(mockPopularProducts as any);
    vi.spyOn(api, "placeProducts").mockResolvedValue(mockProductsResponse as any);

    renderWithProviders(
      <Routes>
        <Route path="/places/:slug" element={<PlaceDetailPage />} />
      </Routes>,
      { route: "/places/bhaktapur" }
    );

    // 1. Breadcrumb navigation & Place Name
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Explore Bhaktapur" })).toBeInTheDocument();
    });

    expect(screen.getAllByText("Home").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Explore by Places").length).toBeGreaterThanOrEqual(1);

    // 2. Place Hero verified description
    expect(
      screen.getByText(/sweet cured curd \(Juju Dhau\)/i)
    ).toBeInTheDocument();

    // 3. Dynamic Categories in place
    expect(screen.getByText("Curd & Dairy")).toBeInTheDocument();
    expect(screen.getByText("Vegetables")).toBeInTheDocument();

    // 4. Most Popular section
    expect(screen.getByText("Most Popular in Bhaktapur")).toBeInTheDocument();

    // 5. Product items
    await waitFor(() => {
      expect(screen.getAllByText("Authentic Juju Dhau Curd").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Bhaktapur Red Radish")).toBeInTheDocument();
    });
  });

  it("allows selecting a category filter in PlaceDetailPage", async () => {
    const mockPlace = {
      id: "bhaktapur",
      name: "Bhaktapur",
      origin: "Bhaktapur, Nepal",
      description: "Famed for traditional agro-produce and sweet curd",
      image: "/src/assets/images/places/bhaktapur.jpg",
      itemCount: 2,
      soldCount: 30,
      activeCategoriesCount: 2,
    };

    const mockCategories = [
      { id: "curd-dairy", name: "Curd & Dairy", productCount: 1 },
      { id: "vegetables", name: "Vegetables", productCount: 1 },
    ];

    vi.spyOn(api, "placeBySlug").mockResolvedValue(mockPlace);
    vi.spyOn(api, "placeCategories").mockResolvedValue(mockCategories);
    vi.spyOn(api, "placePopularProducts").mockResolvedValue([]);
    const placeProductsSpy = vi.spyOn(api, "placeProducts").mockResolvedValue({
      products: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
    });

    renderWithProviders(
      <Routes>
        <Route path="/places/:slug" element={<PlaceDetailPage />} />
      </Routes>,
      { route: "/places/bhaktapur" }
    );

    await waitFor(() => {
      expect(screen.getByText("Curd & Dairy")).toBeInTheDocument();
    });

    const categoryButton = screen.getByRole("button", { name: /curd & dairy/i });
    fireEvent.click(categoryButton);

    await waitFor(() => {
      expect(placeProductsSpy).toHaveBeenCalledWith(
        "bhaktapur",
        expect.objectContaining({
          category: "Curd & Dairy",
        })
      );
    });
  });

  it("filters out lifestyle categories (e.g. Furniture, Kitchen & Dining) and lifestyle products from PlaceDetailPage", async () => {
    const mockPlace = {
      id: "bhaktapur",
      name: "Bhaktapur",
      origin: "Bhaktapur, Nepal",
      description: "Famed for traditional agro-produce and sweet curd",
      image: "/src/assets/images/places/bhaktapur.jpg",
      itemCount: 1,
      soldCount: 10,
      activeCategoriesCount: 1,
    };

    const mockCategoriesWithLifestyle = [
      { id: "vegetables", name: "Vegetables", productCount: 2 },
      { id: "furniture", name: "Furniture", productCount: 1 },
      { id: "kitchen-dining", name: "Kitchen & Dining", productCount: 1 },
      { id: "home-living", name: "Home & Living", productCount: 1 },
    ];

    const mockPopularWithLifestyle = [
      {
        id: "prod-veg-01",
        name: "Bhaktapur Red Radish",
        category: "Vegetables",
        price: 90,
        rating: 4.8,
        origin: "Bhaktapur, Nepal",
        image: "/images/radish.jpg",
      },
      {
        id: "PROD-FURN-01",
        name: "Handcrafted Sisau Wood Dining Table",
        category: "Furniture",
        price: 32500,
        rating: 4.9,
        origin: "Bhaktapur, Nepal",
        image: "/images/table.jpg",
      },
    ];

    const mockProductsWithLifestyle = {
      products: [
        {
          id: "prod-veg-01",
          name: "Bhaktapur Red Radish",
          category: "Vegetables",
          price: 90,
          rating: 4.8,
          origin: "Bhaktapur, Nepal",
          image: "/images/radish.jpg",
        },
        {
          id: "PROD-HOME-01",
          name: "Handwoven Bhaktapur Sukul Grass Rug",
          category: "Home & Living",
          price: 2200,
          rating: 4.8,
          origin: "Bhaktapur, Nepal",
          image: "/images/rug.jpg",
        },
      ],
      total: 2,
      page: 1,
      limit: 12,
      totalPages: 1,
    };

    vi.spyOn(api, "placeBySlug").mockResolvedValue(mockPlace);
    vi.spyOn(api, "placeCategories").mockResolvedValue(mockCategoriesWithLifestyle);
    vi.spyOn(api, "placePopularProducts").mockResolvedValue(mockPopularWithLifestyle as any);
    vi.spyOn(api, "placeProducts").mockResolvedValue(mockProductsWithLifestyle as any);

    renderWithProviders(
      <Routes>
        <Route path="/places/:slug" element={<PlaceDetailPage />} />
      </Routes>,
      { route: "/places/bhaktapur" }
    );

    // Food category should be present
    await waitFor(() => {
      expect(screen.getByText("Vegetables")).toBeInTheDocument();
    });

    // Lifestyle categories should be excluded
    expect(screen.queryByText("Furniture")).not.toBeInTheDocument();
    expect(screen.queryByText("Kitchen & Dining")).not.toBeInTheDocument();
    expect(screen.queryByText("Home & Living")).not.toBeInTheDocument();

    // Food product should be visible
    expect(screen.getAllByText("Bhaktapur Red Radish").length).toBeGreaterThanOrEqual(1);

    // Lifestyle products should NOT be displayed
    expect(screen.queryByText("Handcrafted Sisau Wood Dining Table")).not.toBeInTheDocument();
    expect(screen.queryByText("Handwoven Bhaktapur Sukul Grass Rug")).not.toBeInTheDocument();
  });
});
