import { describe, it, expect } from "vitest";
import { getProductVarieties } from "../data/productVarieties";

describe("Product Varieties & Custom Vendor Products", () => {
  it("does not hijack custom vendor products and provides 4 distinct perspective angles", () => {
    const vendorProduct = {
      id: "vendor-prod-ape-123",
      name: "ape",
      category: "Spices",
      price: 666,
      weight: "2 gram",
      origin: "Mustang, Nepal",
      seller: "Himalayan Fresh Spices",
      image: "/uploads/hiring-flyer.png",
      gallery: ["/uploads/hiring-flyer.png"],
      description: "Organic ape spices from Mustang",
    };

    const varieties = getProductVarieties(vendorProduct);

    // Products must always provide 4 perspective angle varieties matching the UI layout
    expect(varieties).toHaveLength(4);
    expect(varieties[0].title).toBe("ape");
    expect(varieties[0].price).toBe(666);
    expect(varieties[0].origin).toBe("Mustang, Nepal");
    expect(varieties[0].seller).toBe("Himalayan Fresh Spices");
    expect(varieties[0].image).toBe("/uploads/hiring-flyer.png");
    expect(varieties[0].title).not.toContain("Fresh Mountain Hot Red Chilies");

    // Must have 4 distinct view names
    expect(varieties[0].name).toBe("Front View");
    expect(varieties[1].name).toBe("Close-up");
    expect(varieties[2].name).toBe("Cut Section");
    expect(varieties[3].name).toBe("Top Angle");

    // Close-up and perspective views have distinct zoom transforms
    expect(varieties[1].viewTransform?.transform).toBe("scale(1.6)");
    expect(varieties[2].viewTransform?.transform).toBe("scale(1.4)");
  });

  it("provides distinct angle views when a vendor product has multiple distinct images", () => {
    const multiImageVendorProduct = {
      id: "vendor-prod-cardamom-456",
      name: "Organic Black Cardamom",
      category: "Spices",
      price: 1200,
      image: "/uploads/cardamom-1.png",
      gallery: [
        "/uploads/cardamom-1.png",
        "/uploads/cardamom-2.png",
        "/uploads/cardamom-3.png",
      ],
    };

    const varieties = getProductVarieties(multiImageVendorProduct);
    expect(varieties).toHaveLength(4);
    expect(varieties[0].image).toBe("/uploads/cardamom-1.png");
    expect(varieties[1].image).toBe("/uploads/cardamom-2.png");
    expect(varieties[2].image).toBe("/uploads/cardamom-3.png");
    expect(varieties[0].name).toBe("Front View");
    expect(varieties[1].name).toBe("Close-up");
    expect(varieties[2].name).toBe("Cut Section");
    expect(varieties[3].name).toBe("Top Angle");
  });

  it("still provides dedicated angles for catalog products like Apple", () => {
    const appleProduct = {
      id: "1",
      name: "Apple",
      category: "Fruits",
      price: 650,
    };

    const varieties = getProductVarieties(appleProduct);
    expect(varieties).toHaveLength(4);
    expect(varieties[0].title).toBe("Fresh Red Apple");
  });
});
