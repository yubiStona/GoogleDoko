import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import VendorHome from "../pages/vendor/VendorHome";
import {
  VendorProducts,
  VendorAddProduct,
  VendorOrders,
  VendorCustomers,
  VendorSales,
  VendorReviews,
} from "../pages/vendor/VendorPages";
import * as AccountContextModule from "../context/AccountContext";
import { api } from "../api/client";
import { Provider } from "react-redux";
import { store } from "../store";

describe("Vendor Module UI & Empty States", () => {
  const showToastMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    showToastMock.mockReset();
    vi.spyOn(AccountContextModule, "useAccount").mockReturnValue({
      isLoggedIn: true,
      user: {
        id: 44,
        firstName: "Himalayan",
        lastName: "Farmer",
        role: "vendor",
        vendor: {
          businessName: "Himalayan Organic Farm",
          status: "under_review",
        },
      },
      showToast: showToastMock,
      updateUser: vi.fn(),
    } as any);
  });

  it("renders a clean empty dashboard for a brand new vendor with 0 sales and 0 products", async () => {
    vi.spyOn(api, "vendorDashboard").mockResolvedValue({
      stats: {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        averageRating: "No ratings yet",
        ratingCount: 0,
      },
      chart: [],
      bestsellers: [],
      recentOrders: [],
      vendorStatus: "under_review",
    });

    render(
      <MemoryRouter>
        <VendorHome />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("NPR 0")).toBeInTheDocument();
      expect(screen.getByText("No sales yet")).toBeInTheDocument();
      expect(screen.getByText("No orders received yet")).toBeInTheDocument();
      expect(screen.getByText("No product sales yet.")).toBeInTheDocument();
      expect(screen.getByText("No customer reviews yet")).toBeInTheDocument();
    });
  });

  it("renders an appropriate empty state in VendorProducts when vendor has 0 products", async () => {
    vi.spyOn(api, "vendorProducts").mockResolvedValue([]);

    render(
      <MemoryRouter>
        <VendorProducts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("You haven't added any products yet")
      ).toBeInTheDocument();
      expect(screen.getByText("+ Add First Product")).toBeInTheDocument();
    });
  });

  it("renders edit mode with prefilled product data when accessing /vendor/products/:id/edit", async () => {
    vi.spyOn(api, "vendorProductById").mockResolvedValue({
      id: "PROD-APPLE-123",
      name: "Organic Mustang Apples",
      description: "Crisp and fresh mountain apples",
      category: "Fruits",
      price: 350,
      stock: 50,
      weight: "50 kg",
      origin: "Mustang, Nepal",
      active: 1,
      image: "/apple.jpg",
    } as any);

    render(
      <MemoryRouter initialEntries={["/vendor/products/PROD-APPLE-123/edit"]}>
        <Routes>
          <Route path="/vendor/products/:id/edit" element={<VendorAddProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Edit Product Listing")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Organic Mustang Apples")).toBeInTheDocument();
      expect(screen.getByDisplayValue("350")).toBeInTheDocument();
      expect(screen.getByText("Update Listing")).toBeInTheDocument();
    });
  });

  it("VendorOrders dynamically renders orders and supports full fulfillment stage progression", async () => {
    const mockOrder = {
      id: "GD-ORD-901",
      date: "2026-11-03T10:00:00.000Z",
      recipientName: "Sita Sharma",
      recipientPhone: "9841234567",
      deliveryAddress: "Koteshwor, Kathmandu",
      items: [{ productId: "p1", name: "Fresh Apples", quantity: 2, price: 300 }],
      total: 600,
      status: "Pending",
      paymentMethod: "COD",
      paymentStatus: "Pending",
    };

    vi.spyOn(api, "vendorOrders").mockResolvedValue([mockOrder as any]);
    const updateSpy = vi.spyOn(api, "vendorUpdateOrderStatus").mockResolvedValue({
      ok: true,
      status: "Preparing",
      paymentStatus: "Pending",
    } as any);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <VendorOrders />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("GD-ORD-901")).toBeInTheDocument();
      expect(screen.getByText("Sita Sharma")).toBeInTheDocument();
      expect(screen.getByText("Accept & Mark Preparing")).toBeInTheDocument();
    });

    const acceptBtn = screen.getByText("Accept & Mark Preparing");
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith("GD-ORD-901", "Preparing");
      expect(showToastMock).toHaveBeenCalledWith(expect.stringContaining("Preparing"));
    });
  });

  it("VendorCustomers displays real database metrics and customer records", async () => {
    vi.spyOn(api, "vendorCustomers").mockResolvedValue([
      {
        id: "c-101",
        name: "Bibek Poudel",
        email: "bibek@example.com",
        phone: "9812345678",
        location: "Pokhara",
        orders: 3,
        ordersCount: 3,
        spent: 4500,
        totalSpent: 4500,
        lastOrder: "2026-10-30",
        lastOrderDate: "2026-10-30",
        status: "Repeat",
      },
    ]);

    render(
      <MemoryRouter>
        <VendorCustomers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Bibek Poudel")).toBeInTheDocument();
      expect(screen.getByText("bibek@example.com")).toBeInTheDocument();
      expect(screen.getAllByText("Rs. 4,500").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Repeat").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("VendorSales displays genuine financial transactions without fake numbers", async () => {
    vi.spyOn(api, "vendorSales").mockResolvedValue({
      todaySales: 1500,
      weeklySales: 8500,
      monthlySales: 32000,
      completedOrders: 14,
      pendingPayout: 2500,
      transactions: [
        {
          id: "TX-7788",
          customer: "Anu Shrestha",
          items: "Mustang Apples x 3kg",
          amount: 1500,
          payment: "eSewa",
          paymentMethod: "eSewa",
          paymentStatus: "Paid",
          date: "2026-11-02",
          status: "Paid",
        },
      ],
    });

    render(
      <MemoryRouter>
        <VendorSales />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/1,500/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("TX-7788")).toBeInTheDocument();
      expect(screen.getByText("Anu Shrestha")).toBeInTheDocument();
    });
  });

  it("VendorReviews allows vendor to reply to verified buyer reviews and saves to backend", async () => {
    vi.spyOn(api, "vendorReviews").mockResolvedValue({
      averageRating: 5.0,
      totalReviews: 1,
      pendingReplies: 1,
      fiveStarShare: 100,
      reviews: [
        {
          id: 42,
          productId: "prod-1",
          productName: "Organic Honey",
          product: "Organic Honey",
          productImage: "/honey.jpg",
          reviewerName: "Kiran Basnet",
          customer: "Kiran Basnet",
          email: "kiran@example.com",
          rating: 5,
          title: "Delicious Honey",
          body: "Tastes like pure wild nectar!",
          comment: "Tastes like pure wild nectar!",
          date: "2026-11-01",
          status: "Pending Reply",
          reply: null,
          replyAt: null,
        },
      ],
    });

    const replySpy = vi.spyOn(api, "vendorReplyReview").mockResolvedValue({
      id: 42,
      reply: "Thank you Kiran! Harvested fresh from our hives.",
    });

    render(
      <MemoryRouter>
        <VendorReviews />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Kiran Basnet")).toBeInTheDocument();
      expect(screen.getByText("Tastes like pure wild nectar!")).toBeInTheDocument();
    });

    // Click reply button to open modal
    const replyBtn = screen.getByLabelText("Reply to Kiran Basnet");
    fireEvent.click(replyBtn);

    await waitFor(() => {
      expect(screen.getByText("Save & Publish Reply")).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Thank the buyer/i);
    fireEvent.change(textarea, { target: { value: "Thank you Kiran! Harvested fresh from our hives." } });

    const saveBtn = screen.getByText("Save & Publish Reply");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(replySpy).toHaveBeenCalledWith(42, "Thank you Kiran! Harvested fresh from our hives.");
      expect(showToastMock).toHaveBeenCalledWith(expect.stringContaining("Reply published"));
    });
  });
});
