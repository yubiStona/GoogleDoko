import { describe, it, expect } from "vitest";
import { normalizeOrder } from "../utils/normalizeOrder";

describe("normalizeOrder utility", () => {
  it("normalizes an order with JSON items string", () => {
    const raw = {
      id: "GD-12345",
      createdAt: "2026-10-30T10:00:00.000Z",
      status: "pending",
      total: 1500,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      deliveryAddress: "Kathmandu, Nepal",
      recipientName: "Hari Bahadur",
      recipientPhone: "9800000000",
      itemsJson: JSON.stringify([
        {
          id: "apple-1",
          name: "Fresh Red Apple",
          price: 300,
          quantity: 2,
          image: "/images/apple.jpg",
        },
      ]),
    };

    const normalized = normalizeOrder(raw);
    expect(normalized).not.toBeNull();
    expect(normalized?.id).toBe("GD-12345");
    expect(normalized?.total).toBe(1500);
    expect(normalized?.products.length).toBe(1);
    expect(normalized?.products[0].name).toBe("Fresh Red Apple");
  });

  it("handles null or undefined safely", () => {
    expect(normalizeOrder(null)).toBeNull();
    expect(normalizeOrder(undefined)).toBeNull();
  });
});
