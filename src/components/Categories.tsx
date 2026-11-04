import CategoryCard from "./CategoryCard";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useGetCategoriesQuery } from "../store/api/apiSlice";
import { useSideScroll } from "../hooks/useSideScroll";

const fallbackCategories = [
  {
    id: "fruits",
    name: "Fruits",
    description: "Fresh & juicy handpicked mountain fruits",
    image: "/src/frontend/assets/images/categories/fruits.jpg",
    icon: "fruits" as const,
    theme: "orange" as const,
    to: "/categories?category=Fruits",
  },
  {
    id: "vegetables",
    name: "Vegetables",
    description: "Farm fresh organic leafy greens & tubers",
    image: "/src/frontend/assets/images/categories/vegetables.jpg",
    icon: "vegetables" as const,
    theme: "red" as const,
    to: "/categories?category=Vegetables",
  },
  {
    id: "dairy-eggs",
    name: "Dairy & Eggs",
    description: "Farm fresh milk, chhurpi & free-range eggs",
    image: "/assets/images/categories/dairy.jpg",
    icon: "dairy" as const,
    theme: "yellow" as const,
    to: "/categories?category=Dairy%20%26%20Eggs",
  },
  {
    id: "spices",
    name: "Spices",
    description: "Aroma rich organic timur, cumin & cloves",
    image: "/src/frontend/assets/images/categories/spices.jpg",
    icon: "spices" as const,
    theme: "green" as const,
    to: "/categories?category=Spices",
  },
  {
    id: "honey",
    name: "Honey",
    description: "100% wild Himalayan honey & pure nectar",
    image: "/assets/images/categories/honey.jpg",
    icon: "honey" as const,
    theme: "yellow" as const,
    to: "/categories?category=Honey",
  },
  {
    id: "grains",
    name: "Grains",
    description: "Himalayan Marsi rice, millet & lentils",
    image: "/src/frontend/assets/images/categories/grains.jpg",
    icon: "grains" as const,
    theme: "yellow" as const,
    to: "/categories?category=Grains",
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    description: "Natural herbal soaps & skincare essentials",
    image: "/assets/images/categories/beauty.jpg",
    icon: "beauty" as const,
    theme: "rose" as const,
    to: "/categories?category=Beauty%20%26%20Personal%20Care",
  },
  {
    id: "garden",
    name: "Garden & Outdoor",
    description: "Organic seeds, live plants & garden tools",
    image: "/assets/images/categories/garden.jpg",
    icon: "garden" as const,
    theme: "green" as const,
    to: "/categories?category=Garden%20%26%20Outdoor",
  },
];

export interface CategoryMetaEntry {
  icon: string;
  theme: "orange" | "green" | "red" | "teal" | "yellow" | "purple" | "blue" | "rose";
  image: string;
  description: string;
}

// eslint-disable-next-line react-refresh/only-export-components
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

// eslint-disable-next-line react-refresh/only-export-components
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
  const { scrollRef, scrollRight } = useSideScroll();

  const categories = (serverCategories && serverCategories.length > 0)
    ? serverCategories.slice(0, 10).map((c) => {
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
    <section className="categories-section" aria-labelledby="shop-categories-heading">
      <div className="section-header">
        <div>
          <h2 id="shop-categories-heading">Shop By Categories</h2>
          <p className="section-subheading">Browse our freshest harvest, dairy, and artisanal goods</p>
        </div>

        <div className="section-header-actions">
          <Link to="/categories" className="section-view-all">
            View all
          </Link>
          <button
            type="button"
            onClick={scrollRight}
            className="section-scroll-next-btn"
            aria-label="Next categories"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="categories-grid categories-side-scroll-track" ref={scrollRef}>
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