import CategoryCard from "./CategoryCard";
import { Link } from "react-router-dom";
import { useGetCategoriesQuery } from "../store/api/apiSlice";

const fallbackCategories = [
  {
    id: "fruits",
    name: "Fruits",
    description: "Fresh & juicy handpicked",
    image: "/src/frontend/assets/images/categories/fruits.jpg",
    icon: "fruits" as const,
    theme: "orange" as const,
    to: "/categories?category=Fruits",
  },
  {
    id: "spices",
    name: "Spices",
    description: "Aroma rich & natural",
    image: "/src/frontend/assets/images/categories/spices.jpg",
    icon: "spices" as const,
    theme: "green" as const,
    to: "/categories?category=Spices",
  },
  {
    id: "vegetables",
    name: "Vegetables",
    description: "Farm fresh & healthy",
    image: "/src/frontend/assets/images/categories/vegetables.jpg",
    icon: "vegetables" as const,
    theme: "red" as const,
    to: "/categories?category=Vegetables",
  },
  {
    id: "others",
    name: "Others",
    description: "More good things for you",
    image: "/src/frontend/assets/images/categories/others.jpg",
    icon: "others" as const,
    theme: "teal" as const,
    to: "/categories",
  },
];

export interface CategoryMetaEntry {
  icon: string;
  theme: "orange" | "green" | "red" | "teal" | "yellow" | "purple" | "blue" | "rose";
  image: string;
  description: string;
}

export const CATEGORY_META_REGISTRY: Record<string, CategoryMetaEntry> = {
  fruits: {
    icon: "fruits",
    theme: "orange",
    image: "/src/frontend/assets/images/categories/fruits.jpg",
    description: "Fresh & juicy handpicked mountain fruits",
  },
  vegetables: {
    icon: "vegetables",
    theme: "red",
    image: "/src/frontend/assets/images/categories/vegetables.jpg",
    description: "Farm fresh organic vegetables from local valleys",
  },
  spices: {
    icon: "spices",
    theme: "green",
    image: "/src/frontend/assets/images/categories/spices.jpg",
    description: "Aroma-rich authentic traditional Himalayan spices",
  },
  "dairy & eggs": {
    icon: "dairy",
    theme: "yellow",
    image: "/src/frontend/assets/images/categories/dairy.jpg",
    description: "Pure cow & yak dairy, fresh farm eggs",
  },
  "beauty & personal care": {
    icon: "beauty",
    theme: "rose",
    image: "/src/frontend/assets/images/categories/beauty.jpg",
    description: "Herbal skincare, organic soaps & natural cosmetics",
  },
  "fashion & accessories": {
    icon: "fashion",
    theme: "blue",
    image: "/src/frontend/assets/images/categories/fashion.jpg",
    description: "Authentic woolen shawls, apparel & handcrafted bags",
  },
  furniture: {
    icon: "furniture",
    theme: "teal",
    image: "/src/frontend/assets/images/categories/furniture.jpg",
    description: "Handcrafted wooden chairs, tables & living furniture",
  },
  "home & living": {
    icon: "home",
    theme: "purple",
    image: "/src/frontend/assets/images/categories/home-living.jpg",
    description: "Handwoven rugs, bedsheets, cushions & ambient decor",
  },
  "kitchen & dining": {
    icon: "kitchen",
    theme: "orange",
    image: "/src/frontend/assets/images/categories/kitchen.jpg",
    description: "Traditional brassware, ceramic dinner sets & cookware",
  },
  "garden & outdoor": {
    icon: "garden",
    theme: "green",
    image: "/src/frontend/assets/images/categories/garden.jpg",
    description: "Terracotta planters, Himalayan flora & outdoor essentials",
  },
  grains: {
    icon: "grains",
    theme: "yellow",
    image: "/src/frontend/assets/images/categories/grains.jpg",
    description: "Native Jumla Marsi rice, millet & highland grains",
  },
  honey: {
    icon: "honey",
    theme: "orange",
    image: "/src/frontend/assets/images/categories/honey.jpg",
    description: "Wild cliff and flora honey straight from hives",
  },
  "honey & preserves": {
    icon: "honey",
    theme: "orange",
    image: "/src/frontend/assets/images/categories/honey.jpg",
    description: "Wild cliff and flora honey straight from hives",
  },
};

export function getCategoryMeta(name: string): CategoryMetaEntry {
  const n = (name || "").toLowerCase().trim();
  if (CATEGORY_META_REGISTRY[n]) {
    return CATEGORY_META_REGISTRY[n];
  }
  if (n.includes("fruit")) return CATEGORY_META_REGISTRY["fruits"];
  if (n.includes("veg")) return CATEGORY_META_REGISTRY["vegetables"];
  if (n.includes("spice")) return CATEGORY_META_REGISTRY["spices"];
  if (n.includes("dairy") || n.includes("egg") || n.includes("milk")) return CATEGORY_META_REGISTRY["dairy & eggs"];
  if (n.includes("beauty") || n.includes("care") || n.includes("skin") || n.includes("cosmetic")) return CATEGORY_META_REGISTRY["beauty & personal care"];
  if (n.includes("fashion") || n.includes("cloth") || n.includes("wear") || n.includes("shoe") || n.includes("bag")) return CATEGORY_META_REGISTRY["fashion & accessories"];
  if (n.includes("furnit") || n.includes("chair") || n.includes("table") || n.includes("sofa")) return CATEGORY_META_REGISTRY["furniture"];
  if (n.includes("home") || n.includes("living") || n.includes("decor") || n.includes("rug") || n.includes("bed")) return CATEGORY_META_REGISTRY["home & living"];
  if (n.includes("kitchen") || n.includes("dining") || n.includes("cook") || n.includes("plate")) return CATEGORY_META_REGISTRY["kitchen & dining"];
  if (n.includes("garden") || n.includes("outdoor") || n.includes("plant")) return CATEGORY_META_REGISTRY["garden & outdoor"];
  if (n.includes("grain") || n.includes("rice") || n.includes("wheat") || n.includes("millet") || n.includes("pulse")) return CATEGORY_META_REGISTRY["grains"];
  if (n.includes("honey")) return CATEGORY_META_REGISTRY["honey"];

  return {
    icon: "others",
    theme: "teal",
    image: "/src/frontend/assets/images/categories/others.jpg",
    description: "Fresh local produce & artisanal goods",
  };
}

function Categories() {
  const { data: serverCategories } = useGetCategoriesQuery();

  const categories = (serverCategories && serverCategories.length > 0)
    ? serverCategories.slice(0, 4).map((c: any) => {
        const meta = getCategoryMeta(c.name);
        // Use server image if provided and not generic others.jpg, else use meta image
        const hasCustomServerImage = c.image && !c.image.includes("others.jpg");
        const resolvedImage = hasCustomServerImage ? c.image : meta.image;

        return {
          id: c.id || c.slug,
          name: c.name,
          description: c.description || meta.description,
          image: resolvedImage,
          icon: meta.icon,
          theme: meta.theme,
          to: `/categories?category=${encodeURIComponent(c.name)}`,
        };
      })
    : fallbackCategories;

  return (
    <section className="categories-section">
      <div className="section-header">
        <h2>Shop By Categories</h2>

        <Link to="/categories" className="section-view-all">
          View all
        </Link>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            name={category.name}
            description={category.description}
            image={category.image}
            icon={category.icon}
            theme={category.theme}
            to={category.to}
          />
        ))}
      </div>
    </section>
  );
}

export default Categories;