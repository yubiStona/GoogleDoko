import {
  Apple,
  Leaf,
  Carrot,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  description: string;
  image: string;
  icon?: string;
  theme?: string;
  to: string;
}

const icons: Record<string, typeof Apple> = {
  fruits: Apple,
  spices: Leaf,
  vegetables: Carrot,
  others: ShoppingBag,
  dairy: ShoppingBag,
  grains: ShoppingBag,
  honey: ShoppingBag,
};

function CategoryCard({
  name,
  description,
  image,
  icon = "others",
  theme = "teal",
  to,
}: CategoryCardProps) {
  const Icon = icons[icon] || ShoppingBag;

  return (
    <Link to={to} className={`category-card ${theme}`}>
      {/* Image */}
      <div className="category-image">
        <img
          src={image}
          alt={name}
          onError={(e) => {
            e.currentTarget.src = "/src/frontend/assets/images/categories/category-promo.jpg";
          }}
        />
      </div>

      {/* Information */}
      <div className="category-info">
        <div className="category-icon">
          <Icon size={24} strokeWidth={1.8} className="category-svg-icon" />
        </div>

        <div className="category-text">
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;