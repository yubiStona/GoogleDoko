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

function getCategoryMeta(name: string): { icon: "fruits" | "spices" | "vegetables" | "others"; theme: "orange" | "green" | "red" | "teal"; image: string } {
  const n = name.toLowerCase();
  if (n.includes("fruit")) return { icon: "fruits", theme: "orange", image: "/src/frontend/assets/images/categories/fruits.jpg" };
  if (n.includes("spice")) return { icon: "spices", theme: "green", image: "/src/frontend/assets/images/categories/spices.jpg" };
  if (n.includes("veg")) return { icon: "vegetables", theme: "red", image: "/src/frontend/assets/images/categories/vegetables.jpg" };
  return { icon: "others", theme: "teal", image: "/src/frontend/assets/images/categories/others.jpg" };
}

function Categories() {
  const { data: serverCategories } = useGetCategoriesQuery();

  const categories = (serverCategories && serverCategories.length > 0)
    ? serverCategories.slice(0, 4).map((c: any) => {
        const meta = getCategoryMeta(c.name);
        return {
          id: c.id || c.slug,
          name: c.name,
          description: c.description || "Fresh local produce",
          image: meta.image,
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