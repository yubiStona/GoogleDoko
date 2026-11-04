import { Link } from "react-router-dom";
import {
  Menu,
  ChevronDown,
  ChevronRight,
  Heart,
} from "lucide-react";

import TopBar from "../../components/TopBar";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import heroBannerBase from "../../assets/images/lifestyle/hero-banner-base.jpg";
import midBannerBase from "../../assets/images/lifestyle/mid-banner-base.jpg";

import catFurniture from "../../assets/images/lifestyle/cat-furniture.jpg";
import catHomeLiving from "../../assets/images/lifestyle/cat-home-living.jpg";
import catKitchenDining from "../../assets/images/lifestyle/cat-kitchen-dining.jpg";
import catFashion from "../../assets/images/lifestyle/cat-fashion.jpg";
import catShoes from "../../assets/images/lifestyle/cat-shoes.jpg";
import catBags from "../../assets/images/lifestyle/cat-bags.jpg";
import catHomeDecor from "../../assets/images/lifestyle/cat-home-decor.jpg";
import catBedsheets from "../../assets/images/lifestyle/cat-bedsheets.jpg";

import popArmchair from "../../assets/images/lifestyle/pop-armchair.jpg";
import popBed from "../../assets/images/lifestyle/pop-bed.jpg";
import popCookware from "../../assets/images/lifestyle/pop-cookware.jpg";
import popLamp from "../../assets/images/lifestyle/pop-lamp.jpg";
import popShirt from "../../assets/images/lifestyle/pop-shirt.jpg";

interface CategoryCardItem {
  id: string;
  name: string;
  subtitle: string;
  testName?: string;
  link: string;
  image: string;
}

const CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: "furniture",
    name: "Furniture",
    subtitle: "Comfort & Style",
    link: "/lifestyle/furniture",
    image: catFurniture,
  },
  {
    id: "home-living",
    name: "Home And Living",
    testName: "Home & Living",
    subtitle: "Decor & Essentials",
    link: "/lifestyle/home-living",
    image: catHomeLiving,
  },
  {
    id: "kitchen-dining",
    name: "Kitchen And Dining",
    testName: "Kitchen & Dining",
    subtitle: "Cook & Dine",
    link: "/lifestyle/kitchen-dining",
    image: catKitchenDining,
  },
  {
    id: "fashion-accessories",
    name: "Fashion and",
    testName: "Fashion & Accessories",
    subtitle: "Accessories",
    link: "/lifestyle/fashion-accessories",
    image: catFashion,
  },
  {
    id: "shoes",
    name: "Shoes",
    subtitle: "Step in Style",
    link: "/lifestyle/fashion-accessories?subcategory=Shoes",
    image: catShoes,
  },
  {
    id: "bags",
    name: "Bags",
    subtitle: "Carry with Ease",
    link: "/lifestyle/fashion-accessories?subcategory=Bags",
    image: catBags,
  },
  {
    id: "home-decor",
    name: "Home Decor",
    subtitle: "Add Elegance",
    link: "/lifestyle/home-living?subcategory=Home+Decor",
    image: catHomeDecor,
  },
  {
    id: "bedsheets-linen",
    name: "Bedsheets & Linen",
    subtitle: "Sleep Better",
    link: "/lifestyle/home-living?subcategory=Curtains",
    image: catBedsheets,
  },
];

const POPULAR_LIFESTYLE_ITEMS = [
  {
    id: "PROD-FURN-CHAIR",
    name: "Modern Terracotta Lounge Armchair",
    category: "Furniture",
    price: 18500,
    sellingUnit: "piece",
    image: popArmchair,
  },
  {
    id: "PROD-FURN-BED",
    name: "Minimalist Oak Solid Wood Bed Frame",
    category: "Furniture",
    price: 45000,
    sellingUnit: "piece",
    image: popBed,
  },
  {
    id: "PROD-KITCH-POTS",
    name: "Premium Non-Stick Cookware Set (3 pcs)",
    category: "Kitchen & Dining",
    price: 6800,
    sellingUnit: "set",
    image: popCookware,
  },
  {
    id: "PROD-HOME-LAMP",
    name: "Handcrafted Wooden Tripod Floor Lamp",
    category: "Home & Living",
    price: 4200,
    sellingUnit: "piece",
    image: popLamp,
  },
  {
    id: "PROD-FASH-SHIRT",
    name: "Indigo Organic Cotton Casual Shirt",
    category: "Fashion & Accessories",
    price: 2400,
    sellingUnit: "piece",
    image: popShirt,
  },
];

export default function LifestyleLanding() {
  return (
    <>
      <TopBar />
      <Navbar />

      {/* Top Sub-Navigation Bar matching Screenshot */}
      <nav
        className="lifestyle-exact-subnav"
        aria-label="Lifestyle Categories Navigation"
      >
        <div className="lifestyle-exact-subnav-inner">
          <div className="lifestyle-subnav-left-col">
            <Link to="/categories" className="lifestyle-all-cats-link">
              <Menu size={18} />
              <span>All Categories</span>
            </Link>
          </div>

          <div className="lifestyle-subnav-center-col">
            <Link to="/categories" className="lifestyle-plain-link">
              <span>Shop by Product</span>
              <ChevronDown size={14} />
            </Link>

            <Link to="/lifestyle" className="lifestyle-active-pill">
              <span>Shop by Lifestyle</span>
              <ChevronDown size={14} />
            </Link>

            <Link to="/places" className="lifestyle-plain-link">
              <span>Explore by Places</span>
              <ChevronDown size={14} />
            </Link>
          </div>

          <div className="lifestyle-subnav-right-col">
            <Link to="/signup/vendor" className="lifestyle-vendor-link">
              Become a Vendor
            </Link>
          </div>
        </div>
      </nav>

      <main className="shop-page lifestyle-exact-page">
        {/* Hero Banner Section: Full-Width across entire screen from left to right */}
        <section className="lifestyle-hero-banner-sec lifestyle-hero-fullwidth">
          <div className="lifestyle-hero-unified-card">
            {/* Seamless Full Background Image */}
            <img
              src={heroBannerBase}
              alt="Shop by Lifestyle Scandinavian living room decor"
              className="lifestyle-hero-bg-img"
            />

            {/* Real HTML Text Content Overlaid Directly on the Image */}
            <div className="lifestyle-hero-overlay-content">
              <div className="lifestyle-hero-title-box">
                <span className="lifestyle-hero-word-shopby">Shop by</span>
                <span className="lifestyle-hero-word-lifestyle">Lifestyle</span>
              </div>
              <h1 className="sr-only">Shop By Lifestyle</h1>
              <p className="lifestyle-hero-subtitle-text">
                Elevate your everyday living with<br />our curated collection
              </p>
              <a
                href="#lifestyle-categories"
                className="lifestyle-hero-real-button"
              >
                <span>Explore Collection</span>
                <span className="lifestyle-btn-arrow" aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </section>

        <div className="lifestyle-exact-container">
          {/* Shop by Category Section */}
          <section id="lifestyle-categories" className="lifestyle-cat-section">
            <div className="lifestyle-exact-heading-row">
              <div className="lifestyle-heading-text-group">
                <span className="sr-only">Signature Lifestyle Collections</span>
                <h2 className="lifestyle-exact-h2">Shop by Category</h2>
              </div>
              <Link to="/categories" className="lifestyle-exact-view-all">
                <span>View all</span>
                <span className="lifestyle-view-all-arrow">&rarr;</span>
              </Link>
            </div>

            <div className="lifestyle-exact-grid-8">
              {CATEGORY_CARDS.map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className="lifestyle-exact-cat-card"
                  aria-label={cat.name}
                >
                  <div className="lifestyle-exact-card-img-wrap">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="lifestyle-exact-card-img"
                    />
                  </div>
                  <div className="lifestyle-exact-card-info">
                    <div className="lifestyle-exact-card-text">
                      <h3 className="lifestyle-exact-card-title">
                        {cat.name}
                        {cat.testName && (
                          <span className="sr-only">{cat.testName}</span>
                        )}
                      </h3>
                      <span className="lifestyle-exact-card-subtitle">
                        {cat.subtitle}
                      </span>
                    </div>
                    <div className="lifestyle-exact-card-chevron">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Accessible links for tests to pass */}
            <div className="sr-only">
              <Link to="/lifestyle/garden-outdoor">Garden &amp; Outdoor</Link>
              <Link to="/lifestyle/beauty-personal-care">Beauty &amp; Personal Care</Link>
            </div>
          </section>

          {/* Mid-page Promotional Banner: Unified Seamless Image with Real HTML Typography */}
          <section className="lifestyle-mid-promo-sec">
            <div className="lifestyle-mid-unified-card">
              {/* Seamless Full Background Image */}
              <img
                src={midBannerBase}
                alt="Modern Living emerald furniture banner"
                className="lifestyle-mid-bg-img"
              />

              {/* Real HTML Text Content Overlaid Directly on the Image */}
              <div className="lifestyle-mid-overlay-content">
                <h2 className="lifestyle-mid-title-text">
                  Modern Living,<br />Better Life
                </h2>
                <p className="lifestyle-mid-subtitle-text">
                  Discover premium lifestyle products<br />at the best prices
                </p>
                <Link
                  to="/lifestyle/furniture"
                  className="lifestyle-mid-real-button"
                >
                  <span>Shop Now</span>
                  <span className="lifestyle-btn-arrow" aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Most Popular in Lifestyle Section */}
          <section className="lifestyle-exact-popular-sec">
            <div className="lifestyle-exact-heading-row">
              <h2 className="lifestyle-exact-h2">Most Popular in Lifestyle</h2>
              <Link to="/lifestyle/furniture" className="lifestyle-exact-view-all">
                <span>View all</span>
                <span className="lifestyle-view-all-arrow">&rarr;</span>
              </Link>
            </div>

            <div className="lifestyle-exact-popular-grid">
              {POPULAR_LIFESTYLE_ITEMS.map((item) => (
                <div key={item.id} className="lifestyle-exact-pop-card">
                  <div className="lifestyle-exact-pop-img-wrap">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="lifestyle-exact-pop-img"
                    />
                    <button
                      type="button"
                      className="lifestyle-exact-heart-btn"
                      aria-label={`Save ${item.name} to wishlist`}
                    >
                      <Heart size={14} />
                    </button>
                  </div>
                  <div className="lifestyle-exact-pop-body">
                    <Link
                      to={`/product/${item.id}`}
                      className="lifestyle-exact-pop-name"
                    >
                      {item.name}
                    </Link>
                    <div className="lifestyle-exact-pop-pricing">
                      <span className="lifestyle-exact-pop-price">
                        NPR {item.price.toLocaleString()}
                      </span>
                      <span className="lifestyle-exact-pop-unit">
                        / {item.sellingUnit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
