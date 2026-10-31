import { describe, it, expect } from "vitest";
import { normalizeCartItem } from "../context/CartContext";

describe("Cart Item Normalization", () => {
  it("normalizes a raw cart item from backend database row", () => {
    const raw = {
      productId: "prod-apple-1",
      name: "Fresh Red Apple",
      price: 250,
      quantity: 3,
      image: "/src/frontend/assets/images/products/apple.jpg",
      weight: "1 kg",
      origin: "Mustang, Nepal",
      seller: "Mustang Agro",
    };

    const item = normalizeCartItem(raw);
    expect(item.id).toBe("prod-apple-1");
    expect(item.name).toBe("Fresh Red Apple");
    expect(item.price).toBe(250);
    expect(item.quantity).toBe(3);
    expect(item.origin).toBe("Mustang, Nepal");
    expect(item.seller).toBe("Mustang Agro");
    expect(item.image).toBe("/src/assets/images/products/apple.jpg");
  });

  it("handles empty or invalid inputs with defaults", () => {
    const item = normalizeCartItem(null);
    expect(item.id).toBe("");
    expect(item.name).toBe("Product");
    expect(item.quantity).toBe(1);
    expect(item.price).toBe(0);
  });
});
