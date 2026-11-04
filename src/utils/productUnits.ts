export const CATEGORY_ALLOWED_UNITS: Record<string, string[]> = {
  Furniture: ["piece", "set", "pair"],
  "Home & Living": ["piece", "set", "pair", "pack", "roll"],
  "Kitchen & Dining": ["piece", "set", "pair", "pack"],
  "Fashion & Accessories": ["piece", "pair", "set"],
  Clothing: ["piece"],
  Shoes: ["pair", "piece"],
  "Beauty & Personal Care": ["piece", "pack", "set", "ml", "gram"],
  "Garden & Outdoor": ["piece", "set", "pack", "kg"],
  Fruits: ["kg", "gram", "piece", "pack", "dozen"],
  Vegetables: ["kg", "gram", "piece", "pack", "bunch"],
  Grains: ["kg", "gram", "pack", "bag"],
  Spices: ["gram", "kg", "pack", "jar"],
  "Dairy & Eggs": ["litre", "ml", "dozen", "piece", "pack"],
  Honey: ["jar", "kg", "gram", "bottle"],
  "Organic Fruits": ["kg", "gram", "piece", "pack", "dozen"],
  "Fresh Vegetables": ["kg", "gram", "piece", "pack", "bunch"],
  "Local Grains & Rice": ["kg", "gram", "pack", "bag"],
  "Traditional Spices & Herbs": ["gram", "kg", "pack", "bunch"],
  "Himalayan Tea & Coffee": ["gram", "kg", "pack", "box"],
  "Honey & Preserves": ["jar", "kg", "bottle", "pack"],
  "Bakery & Sweets": ["piece", "box", "pack", "gram"],
  Others: [
    "piece",
    "set",
    "pair",
    "pack",
    "box",
    "kg",
    "gram",
    "litre",
    "ml",
    "dozen",
    "bunch",
    "metre",
  ],
};

export const ALL_MARKETPLACE_CATEGORIES = [
  "Organic Fruits",
  "Fresh Vegetables",
  "Dairy & Eggs",
  "Local Grains & Rice",
  "Traditional Spices & Herbs",
  "Honey & Preserves",
  "Furniture",
  "Home & Living",
  "Kitchen & Dining",
  "Fashion & Accessories",
  "Garden & Outdoor",
  "Beauty & Personal Care",
  "Himalayan Tea & Coffee",
  "Bakery & Sweets",
  "Others",
];

const MEASURABLE_UNITS = new Set(["kg", "gram", "litre", "ml", "metre"]);

export function getAllowedUnitsForCategory(category?: string): string[] {
  if (!category) return CATEGORY_ALLOWED_UNITS["Others"];
  const cat = category.trim().toLowerCase();

  for (const [key, units] of Object.entries(CATEGORY_ALLOWED_UNITS)) {
    if (key.toLowerCase() === cat) return units;
  }

  if (cat.includes("furniture")) return CATEGORY_ALLOWED_UNITS["Furniture"];
  if (cat.includes("home") || cat.includes("living")) return CATEGORY_ALLOWED_UNITS["Home & Living"];
  if (cat.includes("kitchen") || cat.includes("dining")) return CATEGORY_ALLOWED_UNITS["Kitchen & Dining"];
  if (cat.includes("cloth") || cat.includes("fashion")) return CATEGORY_ALLOWED_UNITS["Fashion & Accessories"];
  if (cat.includes("shoe")) return CATEGORY_ALLOWED_UNITS["Shoes"];
  if (cat.includes("beauty") || cat.includes("personal")) return CATEGORY_ALLOWED_UNITS["Beauty & Personal Care"];
  if (cat.includes("garden") || cat.includes("outdoor")) return CATEGORY_ALLOWED_UNITS["Garden & Outdoor"];
  if (cat.includes("fruit")) return CATEGORY_ALLOWED_UNITS["Fruits"];
  if (cat.includes("veg")) return CATEGORY_ALLOWED_UNITS["Vegetables"];
  if (cat.includes("grain") || cat.includes("rice")) return CATEGORY_ALLOWED_UNITS["Grains"];
  if (cat.includes("spice") || cat.includes("herb")) return CATEGORY_ALLOWED_UNITS["Spices"];
  if (cat.includes("dairy") || cat.includes("egg") || cat.includes("milk")) return CATEGORY_ALLOWED_UNITS["Dairy & Eggs"];
  if (cat.includes("honey")) return CATEGORY_ALLOWED_UNITS["Honey"];

  return CATEGORY_ALLOWED_UNITS["Others"];
}

export function isDecimalAllowedForUnit(unit?: string): boolean {
  if (!unit) return false;
  return MEASURABLE_UNITS.has(unit.trim().toLowerCase());
}

export function isLifestyleCategory(category?: string): boolean {
  if (!category) return false;
  const c = category.toLowerCase();
  return (
    c.includes("furniture") ||
    c.includes("home") ||
    c.includes("living") ||
    c.includes("kitchen") ||
    c.includes("dining") ||
    c.includes("fashion") ||
    c.includes("cloth") ||
    c.includes("shoe") ||
    c.includes("decor") ||
    c.includes("garden") ||
    c.includes("beauty")
  );
}

export function resolveProductSellingUnit(
  category?: string,
  sellingUnit?: string,
  weight?: string
): string {
  if (sellingUnit && sellingUnit.trim()) {
    return sellingUnit.trim().toLowerCase();
  }

  const isLifestyle = isLifestyleCategory(category);
  const w = (weight || "").toLowerCase();

  if (isLifestyle) {
    if (w.includes("set") || (category && category.toLowerCase().includes("furniture") && w.includes("set"))) {
      return "set";
    }
    if (w.includes("pair") || (category && category.toLowerCase().includes("shoe"))) {
      return "pair";
    }
    return "piece";
  }

  // Grocery heuristics
  if (w.includes("dozen")) return "dozen";
  if (w.includes("bunch")) return "bunch";
  if (w.includes("litre") || (w.includes("l") && !w.includes("ml") && !w.includes("set"))) return "litre";
  if (w.includes("jar")) return "jar";
  if (w.includes("kg")) return "kg";
  if (w.includes("gram") || w.includes("g")) return "gram";
  if (w.includes("pack")) return "pack";
  if (w.includes("piece") || w.includes("pc")) return "piece";

  return "kg";
}

export function formatPricePerUnit(
  price: number,
  sellingUnit?: string,
  category?: string
): string {
  const unit = resolveProductSellingUnit(category, sellingUnit);
  return `Rs. ${price.toLocaleString()} / ${unit}`;
}

export function formatQuantityWithUnit(
  quantity: number,
  sellingUnit?: string,
  category?: string
): string {
  const unit = resolveProductSellingUnit(category, sellingUnit);
  const isPlural = quantity > 1;

  if (unit === "piece") return `${quantity} ${isPlural ? "pieces" : "piece"}`;
  if (unit === "set") return `${quantity} ${isPlural ? "sets" : "set"}`;
  if (unit === "pair") return `${quantity} ${isPlural ? "pairs" : "pair"}`;
  if (unit === "pack") return `${quantity} ${isPlural ? "packs" : "pack"}`;
  if (unit === "box") return `${quantity} ${isPlural ? "boxes" : "box"}`;
  if (unit === "dozen") return `${quantity} ${isPlural ? "dozens" : "dozen"}`;
  if (unit === "bunch") return `${quantity} ${isPlural ? "bunches" : "bunch"}`;
  if (unit === "jar") return `${quantity} ${isPlural ? "jars" : "jar"}`;
  if (unit === "litre") return `${quantity} ${isPlural ? "litres" : "litre"}`;
  if (unit === "kg") return `${quantity} kg`;
  if (unit === "gram") return `${quantity} g`;
  if (unit === "ml") return `${quantity} ml`;

  return `${quantity} ${unit}`;
}
