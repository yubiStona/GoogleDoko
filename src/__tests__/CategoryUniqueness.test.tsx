import { describe, it, expect } from "vitest";
import { getCategoryMeta } from "../components/Categories";

describe("Shop by Categories - Image Uniqueness & Meta Tests", () => {
  it("provides unique images for distinct categories", () => {
    const beautyMeta = getCategoryMeta("Beauty & Personal Care");
    const dairyMeta = getCategoryMeta("Dairy & Eggs");
    const fashionMeta = getCategoryMeta("Fashion & Accessories");
    const fruitsMeta = getCategoryMeta("Fruits");

    // All 4 category images must be distinct
    const images = [beautyMeta.image, dairyMeta.image, fashionMeta.image, fruitsMeta.image];
    const uniqueImages = new Set(images);
    expect(uniqueImages.size).toBe(4);

    expect(beautyMeta.image).toContain("beauty.jpg");
    expect(dairyMeta.image).toContain("dairy.jpg");
    expect(fashionMeta.image).toContain("fashion.jpg");
    expect(fruitsMeta.image).toContain("fruits.jpg");
  });

  it("provides unique themes and icons for distinct categories", () => {
    const beautyMeta = getCategoryMeta("Beauty & Personal Care");
    const dairyMeta = getCategoryMeta("Dairy & Eggs");
    const fashionMeta = getCategoryMeta("Fashion & Accessories");
    const fruitsMeta = getCategoryMeta("Fruits");

    expect(beautyMeta.icon).toBe("beauty");
    expect(beautyMeta.theme).toBe("rose");

    expect(dairyMeta.icon).toBe("dairy");
    expect(dairyMeta.theme).toBe("yellow");

    expect(fashionMeta.icon).toBe("fashion");
    expect(fashionMeta.theme).toBe("blue");

    expect(fruitsMeta.icon).toBe("fruits");
    expect(fruitsMeta.theme).toBe("orange");
  });

  it("resolves all lifestyle and grocery categories with dedicated images", () => {
    const testCases = [
      { name: "Vegetables", expectedImg: "vegetables.jpg" },
      { name: "Spices", expectedImg: "spices.jpg" },
      { name: "Grains", expectedImg: "grains.jpg" },
      { name: "Honey", expectedImg: "honey.jpg" },
      { name: "Furniture", expectedImg: "furniture.jpg" },
      { name: "Home & Living", expectedImg: "home-living.jpg" },
      { name: "Kitchen & Dining", expectedImg: "kitchen.jpg" },
      { name: "Garden & Outdoor", expectedImg: "garden.jpg" },
    ];

    for (const { name, expectedImg } of testCases) {
      const meta = getCategoryMeta(name);
      expect(meta.image).toContain(expectedImg);
    }
  });
});
