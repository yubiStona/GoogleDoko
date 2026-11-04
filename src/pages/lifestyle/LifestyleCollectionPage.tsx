import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  Search,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
  Leaf,
  X,
  Armchair,
  Home,
  UtensilsCrossed,
  Flower2,
  Shirt,
} from "lucide-react";

import TopBar from "../../components/TopBar";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ProductCard from "../../components/product/ProductCard";
import Pagination from "../../components/Pagination";
import { ProductSkeletonGrid } from "../../components/product/ProductSkeleton";
import { api, type LifestyleCollection, type LifestyleProductsResponse } from "../../api/client";
import { type Product } from "../../data/products";

const COLLECTION_ICONS: Record<string, any> = {
  furniture: Armchair,
  "home-living": Home,
  "kitchen-dining": UtensilsCrossed,
  "garden-outdoor": Flower2,
  "beauty-personal-care": Sparkles,
  "fashion-accessories": Shirt,
};

export default function LifestyleCollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const subcategoryParam = searchParams.get("subcategory") || "all";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "popular";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(searchParam);
  const [collection, setCollection] = useState<LifestyleCollection | null>(null);
  const [data, setData] = useState<LifestyleProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load collection and products
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;

    api
      .lifestyleProducts(slug, {
        search: searchParam || undefined,
        subcategory: subcategoryParam !== "all" ? subcategoryParam : undefined,
        minPrice,
        maxPrice,
        sort: sortParam,
        page: pageParam,
        limit: 12,
      })
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setCollection(res.collection);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load lifestyle products:", err);
          setError("Failed to load products for this lifestyle collection.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug, subcategoryParam, searchParam, sortParam, minPriceParam, maxPriceParam, pageParam]);

  // Handle filter changes
  function updateFilters(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined || val === "" || val === "all") {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    }
    // Reset page to 1 when changing filters other than page
    if (!("page" in updates)) {
      next.delete("page");
    }
    setSearchParams(next);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  }

  function handleClearFilters() {
    setSearchInput("");
    setSearchParams({});
  }

  const IconComponent =
    (slug && COLLECTION_ICONS[slug]) ||
    (collection && COLLECTION_ICONS[collection.icon]) ||
    Sparkles;

  const productsList = (data?.products || []) as unknown as Product[];
  const hasActiveFilters =
    subcategoryParam !== "all" ||
    searchParam !== "" ||
    minPriceParam !== "" ||
    maxPriceParam !== "";

  return (
    <>
      <TopBar />
      <Navbar />

      <main className="shop-page lifestyle-collection-page">
        {/* Breadcrumbs */}
        <div className="lifestyle-breadcrumbs-wrap">
          <div className="lifestyle-breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/lifestyle">Shop by Lifestyle</Link>
            <ChevronRight size={14} />
            <span className="current">{collection?.name || slug}</span>
          </div>
        </div>

        {/* Collection Hero Header */}
        <section
          className="lifestyle-collection-hero"
          style={{
            backgroundImage: collection?.image
              ? `linear-gradient(rgba(17, 24, 39, 0.72), rgba(17, 24, 39, 0.72)), url(${collection.image})`
              : undefined,
          }}
        >
          <div className="lifestyle-collection-hero-content">
            <div className="lifestyle-hero-top-badge">
              <span className="lifestyle-hero-icon-bubble">
                <IconComponent size={22} />
              </span>
              <span>LIFESTYLE COLLECTION</span>
            </div>

            <h1>{collection?.name || "Lifestyle Collection"}</h1>
            <p className="lifestyle-hero-description">
              {collection?.description ||
                "Handcrafted furnishings, daily essentials, and organic living products."}
            </p>

            <div className="lifestyle-hero-stats">
              <div className="lifestyle-stat-pill">
                <ShoppingBag size={14} />
                <span>{data?.total ?? collection?.productCount ?? 0} Products</span>
              </div>
              {collection?.subcategories && (
                <div className="lifestyle-stat-pill secondary">
                  <span>{collection.subcategories.length} Subcategories</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Subcategories Navigation Pills */}
        {collection?.subcategories && collection.subcategories.length > 0 && (
          <section className="lifestyle-subcategories-bar-section">
            <div className="lifestyle-subcategories-bar">
              <button
                type="button"
                className={`lifestyle-subcat-pill ${
                  subcategoryParam === "all" ? "active" : ""
                }`}
                onClick={() => updateFilters({ subcategory: "all" })}
              >
                All {collection.name}
              </button>

              {collection.subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  className={`lifestyle-subcat-pill ${
                    subcategoryParam.toLowerCase() === sub.toLowerCase()
                      ? "active"
                      : ""
                  }`}
                  onClick={() => updateFilters({ subcategory: sub })}
                >
                  {sub}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Search & Sort Toolbar */}
        <section className="lifestyle-toolbar-section">
          <div className="lifestyle-toolbar-container">
            {/* Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="lifestyle-search-form"
              role="search"
            >
              <Search size={18} className="lifestyle-search-icon" />
              <input
                type="text"
                placeholder={`Search within ${collection?.name || "collection"}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="lifestyle-search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateFilters({ search: "" });
                  }}
                  className="lifestyle-search-clear"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* Sort & Filter Controls */}
            <div className="lifestyle-controls-group">
              {/* Price Filter dropdown or inputs */}
              <div className="lifestyle-price-filter-wrap">
                <span className="lifestyle-filter-label">Price (NPR):</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceParam}
                  onChange={(e) => updateFilters({ minPrice: e.target.value })}
                  className="lifestyle-price-input"
                  min="0"
                />
                <span className="lifestyle-price-sep">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceParam}
                  onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                  className="lifestyle-price-input"
                  min="0"
                />
              </div>

              {/* Sort Select */}
              <div className="lifestyle-sort-wrap">
                <ArrowUpDown size={16} className="lifestyle-sort-icon" />
                <select
                  value={sortParam}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="lifestyle-sort-select"
                  aria-label="Sort products"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filter tags row */}
          {hasActiveFilters && (
            <div className="lifestyle-active-filters-row">
              <span className="active-filters-label">Active Filters:</span>
              {subcategoryParam !== "all" && (
                <span className="active-filter-badge">
                  Category: {subcategoryParam}
                  <button
                    type="button"
                    onClick={() => updateFilters({ subcategory: "all" })}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {searchParam && (
                <span className="active-filter-badge">
                  Search: "{searchParam}"
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateFilters({ search: "" });
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {(minPriceParam || maxPriceParam) && (
                <span className="active-filter-badge">
                  Price: {minPriceParam || "0"} - {maxPriceParam || "Any"}
                  <button
                    type="button"
                    onClick={() => updateFilters({ minPrice: "", maxPrice: "" })}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                type="button"
                className="clear-all-filters-btn"
                onClick={handleClearFilters}
              >
                Clear All
              </button>
            </div>
          )}
        </section>

        {/* Products Section */}
        <section className="all-products-section lifestyle-products-section">
          <div className="all-products-heading">
            <h2>
              {subcategoryParam !== "all"
                ? `${subcategoryParam} in ${collection?.name || ""}`
                : collection?.name || "Products"}
            </h2>
            <p>
              Showing {data?.total ?? 0} items handcrafted and responsibly sourced
            </p>
          </div>

          {loading ? (
            <div className="categories-products-grid">
              <ProductSkeletonGrid count={8} />
            </div>
          ) : error ? (
            <div className="no-products-message">
              <Leaf size={40} />
              <h3>Collection Unavailable</h3>
              <p>{error}</p>
              <Link to="/lifestyle" className="lifestyle-back-btn">
                Return to Lifestyle Hub
              </Link>
            </div>
          ) : productsList.length > 0 ? (
            <>
              <div className="categories-products-grid">
                {productsList.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      gallery: (product as any).gallery || [product.image],
                    } as Product}
                  />
                ))}
              </div>

              {data && data.totalPages > 1 && (
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  onChange={(nextPage) => {
                    updateFilters({ page: String(nextPage) });
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                />
              )}
            </>
          ) : (
            <div className="no-products-message">
              <Leaf size={40} />
              <h3>No products found</h3>
              <p>
                No items match your active filters in this lifestyle collection.
              </p>
              <button type="button" onClick={handleClearFilters}>
                Reset all filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
