import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";

import { useSideScroll } from "../hooks/useSideScroll";

import catFurniture from "../assets/images/lifestyle/cat-furniture.jpg";
import catHomeLiving from "../assets/images/lifestyle/cat-home-living.jpg";
import catKitchenDining from "../assets/images/lifestyle/cat-kitchen-dining.jpg";
import catFashion from "../assets/images/lifestyle/cat-fashion.jpg";
import catShoes from "../assets/images/lifestyle/cat-shoes.jpg";
import catBags from "../assets/images/lifestyle/cat-bags.jpg";
import catHomeDecor from "../assets/images/lifestyle/cat-home-decor.jpg";
import catBedsheets from "../assets/images/lifestyle/cat-bedsheets.jpg";

interface LifestyleCardItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  link: string;
  image: string;
  badge?: string;
}

const LIFESTYLE_COLLECTIONS: LifestyleCardItem[] = [
  {
    id: "furniture",
    name: "Furniture",
    subtitle: "Comfort & Style",
    description: "Modern sofas, handcrafted tables & solid wood beds",
    link: "/lifestyle/furniture",
    image: catFurniture,
    badge: "Trending",
  },
  {
    id: "home-living",
    name: "Home & Living",
    subtitle: "Decor & Essentials",
    description: "Curated lamps, soft linen, cushions & wall decor",
    link: "/lifestyle/home-living",
    image: catHomeLiving,
    badge: "Popular",
  },
  {
    id: "kitchen-dining",
    name: "Kitchen & Dining",
    subtitle: "Cook & Dine",
    description: "Premium cookware, dinner sets, tableware & storage",
    link: "/lifestyle/kitchen-dining",
    image: catKitchenDining,
    badge: "Essentials",
  },
  {
    id: "fashion-accessories",
    name: "Fashion & Accessories",
    subtitle: "Step in Style",
    description: "Cotton apparel, authentic bags, belts & footwear",
    link: "/lifestyle/fashion-accessories",
    image: catFashion,
    badge: "New",
  },
  {
    id: "shoes",
    name: "Shoes & Footwear",
    subtitle: "Everyday Comfort",
    description: "Breathable sneakers, leather shoes & traditional slip-ons",
    link: "/lifestyle/fashion-accessories?subcategory=Shoes",
    image: catShoes,
    badge: "Best Seller",
  },
  {
    id: "bags",
    name: "Bags & Backpacks",
    subtitle: "Carry With Ease",
    description: "Handcrafted tote bags, leather satchels & travel duffels",
    link: "/lifestyle/fashion-accessories?subcategory=Bags",
    image: catBags,
    badge: "Handmade",
  },
  {
    id: "home-decor",
    name: "Home Decor",
    subtitle: "Add Elegance",
    description: "Artisanal planters, statement wall mirrors & brass accents",
    link: "/lifestyle/home-living?subcategory=Home+Decor",
    image: catHomeDecor,
    badge: "Artisan",
  },
  {
    id: "bedsheets-linen",
    name: "Bedsheets & Linen",
    subtitle: "Sleep Better",
    description: "100% natural cotton bedspreads, quilts & soft pillows",
    link: "/lifestyle/home-living?subcategory=Curtains",
    image: catBedsheets,
    badge: "Pure Cotton",
  },
];

export default function ShopByLifestyle() {
  const { scrollRef, scrollRight } = useSideScroll();

  return (
    <section className="shop-by-lifestyle-section" aria-labelledby="shop-lifestyle-heading">
      <div className="section-header">
        <div>
          <div className="section-title-with-pill">
            <h2 id="shop-lifestyle-heading">Shop by Lifestyle</h2>
            <span className="lifestyle-tag-pill">
              <Sparkles size={12} />
              <span>Modern Living</span>
            </span>
          </div>
          <p className="section-subheading">
            Elevate your home and everyday living with our handpicked lifestyle collections
          </p>
        </div>

        <div className="section-header-actions">
          <Link to="/lifestyle" className="section-view-all">
            View all
          </Link>
          <button
            type="button"
            onClick={scrollRight}
            className="section-scroll-next-btn"
            aria-label="Next lifestyle collections"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="lifestyle-home-grid lifestyle-side-scroll-track" ref={scrollRef}>
        {LIFESTYLE_COLLECTIONS.map((cat) => (
          <Link
            key={cat.id}
            to={cat.link}
            className="lifestyle-home-card"
            aria-label={`Explore ${cat.name} lifestyle collection`}
          >
            <div className="lifestyle-home-img-wrap">
              <img
                src={cat.image}
                alt={cat.name}
                className="lifestyle-home-img"
              />
              {cat.badge && (
                <span className="lifestyle-home-badge">{cat.badge}</span>
              )}
            </div>

            <div className="lifestyle-home-info">
              <div className="lifestyle-home-text">
                <h3 className="lifestyle-home-title">{cat.name}</h3>
                <span className="lifestyle-home-subtitle">{cat.subtitle}</span>
                <p className="lifestyle-home-desc">{cat.description}</p>
              </div>

              <div className="lifestyle-home-arrow-circle" aria-hidden="true">
                <ArrowRight size={15} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
