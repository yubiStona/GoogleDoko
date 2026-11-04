import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  MapPin,
  ChevronRight,
  Search,
  ArrowUpDown,
  Filter,
  ShoppingBag,
  Leaf,
  X,
  TrendingUp,
  Tag,
} from "lucide-react";

import TopBar from "../../components/TopBar";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ProductCard from "../../components/product/ProductCard";
import Pagination from "../../components/Pagination";
import { ProductSkeletonGrid } from "../../components/product/ProductSkeleton";
import {
  api,
  type ApiPlace,
  type PlaceCategorySummary,
  type PlaceProductsResponse,
} from "../../api/client";
import { type Product } from "../../data/products";

const placeImages = import.meta.glob("../../assets/images/places/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function getPlaceImage(slugOrOrigin: string): string {
  const slug = slugOrOrigin.split(",")[0].trim().toLowerCase().replace(/\s+/g, "-");
  return (
    placeImages[`../../assets/images/places/${slug}.jpg`] ||
    placeImages["../../assets/images/places/ilam.jpg"] ||
    "/src/assets/images/places/ilam.jpg"
  );
}

export default function PlaceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "popular";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  // Local state
  const [searchInput, setSearchInput] = useState(searchParam);
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  const [place, setPlace] = useState<ApiPlace | null>(null);
  const [categories, setCategories] = useState<PlaceCategorySummary[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [productsData, setProductsData] = useState<PlaceProductsResponse | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentSlug = useMemo(() => {
    return (slug || "").toLowerCase().trim();
  }, [slug]);

  // Synchronize inputs if URL changes externally
  useEffect(() => {
    setSearchInput(searchParam);
    setMinPriceInput(minPriceParam);
    setMaxPriceInput(maxPriceParam);
  }, [searchParam, minPriceParam, maxPriceParam]);

  // Load place metadata and available categories
  useEffect(() => {
    if (!currentSlug) return;
    let cancelled = false;
    setError(null);

    Promise.all([
      api.placeBySlug(currentSlug),
      api.placeCategories(currentSlug),
    ])
      .then(([placeRes, catsRes]) => {
        if (!cancelled) {
          setPlace(placeRes);
          setCategories(catsRes || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to fetch place metadata:", err);
          setError("Place details could not be loaded. Please check your connection or choose another location.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentSlug]);

  // Load popular products strictly for this place
  useEffect(() => {
    if (!currentSlug) return;
    let cancelled = false;
    setLoadingPopular(true);

    api
      .placePopularProducts(currentSlug, 4)
      .then((res) => {
        if (!cancelled) {
          setPopularProducts((res as any[]) || []);
          setLoadingPopular(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("Failed to load popular place products:", err);
          setPopularProducts([]);
          setLoadingPopular(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentSlug]);

  // Load paginated filtered products for this place
  useEffect(() => {
    if (!currentSlug) return;
    let cancelled = false;
    setLoadingProducts(true);

    const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;

    api
      .placeProducts(currentSlug, {
        category: categoryParam !== "all" ? categoryParam : undefined,
        search: searchParam || undefined,
        minPrice,
        maxPrice,
        sort: sortParam,
        page: pageParam,
        limit: 12,
      })
      .then((res) => {
        if (!cancelled) {
          setProductsData(res);
          setLoadingProducts(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load place products:", err);
          setLoadingProducts(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentSlug, categoryParam, searchParam, sortParam, minPriceParam, maxPriceParam, pageParam]);

  // Helper to update filters in URL search params without reload
  function updateFilters(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined || val === "" || val === "all") {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    }
    // Reset to page 1 unless page is explicitly updated
    if (!("page" in updates)) {
      next.delete("page");
    }
    setSearchParams(next, { replace: true });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  }

  function handlePriceFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({
      minPrice: minPriceInput.trim(),
      maxPrice: maxPriceInput.trim(),
    });
  }

  function clearAllFilters() {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  const hasActiveFilters =
    categoryParam !== "all" ||
    !!searchParam ||
    !!minPriceParam ||
    !!maxPriceParam ||
    sortParam !== "popular";

  const bannerImage = place ? getPlaceImage(place.id) : getPlaceImage(currentSlug);
  const placeName = place?.name || currentSlug.charAt(0).toUpperCase() + currentSlug.slice(1);
  const totalItemsCount = place?.itemCount ?? productsData?.total ?? 0;
  const productsList = productsData?.products || [];

  return (
    <>
      <TopBar />
      <Navbar />

      <main className="shop-page place-detail-page">
        {/* Breadcrumb Navigation */}
        <nav className="place-breadcrumb-nav" aria-label="Breadcrumb">
          <div className="place-breadcrumb-container">
            <Link to="/" className="place-breadcrumb-link">
              Home
            </Link>
            <ChevronRight size={14} className="place-breadcrumb-sep" />
            <Link to="/places" className="place-breadcrumb-link">
              Explore by Places
            </Link>
            <ChevronRight size={14} className="place-breadcrumb-sep" />
            <span className="place-breadcrumb-current">{placeName}</span>
          </div>
        </nav>

        {/* Section A: Place Hero Banner & Information */}
        <section
          className="place-hero-banner"
          style={{ backgroundImage: `url(${bannerImage})` }}
        >
          <div className="place-hero-overlay">
            <div className="place-hero-content">
              <div className="place-hero-badge">
                <Leaf size={14} />
                <span>AUTHENTIC REGIONAL ORIGIN</span>
              </div>

              <h1 className="place-hero-title">
                Explore {placeName}
              </h1>

              <div className="place-hero-origin-pill">
                <MapPin size={16} />
                <span>{place?.origin || `${placeName}, Nepal`}</span>
              </div>

              <p className="place-hero-description">
                {place?.description ||
                  `Discover fresh organic produce, traditional spices, and seasonal harvest grown in the fertile soils of ${placeName}.`}
              </p>

              {/* Verified Place Metrics */}
              <div className="place-hero-stats">
                <div className="place-stat-card">
                  <span className="place-stat-value">{totalItemsCount}</span>
                  <span className="place-stat-label">Products Available</span>
                </div>
                <div className="place-stat-card">
                  <span className="place-stat-value">{categories.length}</span>
                  <span className="place-stat-label">Product Categories</span>
                </div>
                <div className="place-stat-card">
                  <span className="place-stat-value">
                    {place?.soldCount ? `${place.soldCount}+` : "Verified"}
                  </span>
                  <span className="place-stat-label">Delivered from {placeName}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section B: Categories Available in this Place */}
        <section className="place-categories-section">
          <div className="place-section-header">
            <div className="place-section-badge">
              <Tag size={14} />
              <span>LOCATION CATEGORIES</span>
            </div>
            <h2>Shop by Category in {placeName}</h2>
            <p>
              Select a category below to explore authentic goods grown and harvested strictly in {placeName}.
            </p>
          </div>

          <div className="place-categories-scroll">
            {/* All Categories Option */}
            <button
              type="button"
              className={`place-category-pill ${categoryParam === "all" ? "active" : ""}`}
              onClick={() => updateFilters({ category: "all" })}
            >
              <ShoppingBag size={16} />
              <span className="category-pill-name">All Categories</span>
              <span className="category-pill-count">{totalItemsCount}</span>
            </button>

            {/* Dynamic categories derived strictly from products belonging to this location */}
            {categories.map((cat) => {
              const isSelected =
                categoryParam.toLowerCase() === cat.name.toLowerCase() ||
                categoryParam.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`place-category-pill ${isSelected ? "active" : ""}`}
                  onClick={() => updateFilters({ category: cat.name })}
                >
                  <span className="category-pill-name">{cat.name}</span>
                  <span className="category-pill-count">{cat.productCount}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section C: Most Popular Items from this Place */}
        {(loadingPopular || popularProducts.length > 0) && (
          <section className="place-popular-section">
            <div className="place-section-header">
              <div className="place-section-badge popular-badge">
                <TrendingUp size={14} />
                <span>TOP PICKS</span>
              </div>
              <h2>Most Popular in {placeName}</h2>
              <p>
                Bestselling regional specialties and customer favorites from {placeName}.
              </p>
            </div>

            {loadingPopular ? (
              <div className="categories-products-grid place-popular-grid">
                <ProductSkeletonGrid count={4} />
              </div>
            ) : (
              <div className="categories-products-grid place-popular-grid">
                {popularProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{
                      ...p,
                      gallery: (p as any).gallery || [p.image],
                    } as Product}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Section D & E: Products Listing with Search & Filters */}
        <section className="place-products-section" id="place-products-list">
          <div className="place-section-header">
            <h2>
              {categoryParam !== "all"
                ? `${categoryParam} from ${placeName}`
                : `All Products from ${placeName}`}
            </h2>
            <p>
              Showing {productsData?.total ?? 0} authentic farm products from {placeName}
            </p>
          </div>

          {/* Place Toolbar: Search, Price Filters, Sort */}
          <div className="place-toolbar-container">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="place-search-form" role="search">
              <Search size={18} className="place-search-icon" />
              <input
                type="text"
                placeholder={`Search products in ${placeName}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="place-search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateFilters({ search: "" });
                  }}
                  className="place-search-clear"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="place-search-submit">
                Search
              </button>
            </form>

            {/* Price Filter & Sort */}
            <div className="place-toolbar-actions">
              {/* Price Filter Box */}
              <form onSubmit={handlePriceFilterSubmit} className="place-price-filter-form">
                <Filter size={15} className="place-filter-icon" />
                <span className="price-label">Price:</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="place-price-input"
                  min="0"
                />
                <span className="price-sep">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="place-price-input"
                  min="0"
                />
                <button type="submit" className="place-price-apply-btn">
                  Apply
                </button>
              </form>

              {/* Sort Dropdown */}
              <div className="place-sort-wrap">
                <ArrowUpDown size={15} className="place-sort-icon" />
                <select
                  value={sortParam}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="place-sort-select"
                  aria-label={`Sort products in ${placeName}`}
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

          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <div className="place-active-filters-bar">
              <span className="active-filters-title">Active Filters:</span>
              {categoryParam !== "all" && (
                <span className="active-filter-tag">
                  Category: {categoryParam}
                  <button type="button" onClick={() => updateFilters({ category: "all" })}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {searchParam && (
                <span className="active-filter-tag">
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
                <span className="active-filter-tag">
                  Price: Rs. {minPriceParam || "0"} - Rs. {maxPriceParam || "Any"}
                  <button
                    type="button"
                    onClick={() => {
                      setMinPriceInput("");
                      setMaxPriceInput("");
                      updateFilters({ minPrice: "", maxPrice: "" });
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button type="button" onClick={clearAllFilters} className="clear-all-filters-btn">
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid / States */}
          {loadingProducts ? (
            <div className="categories-products-grid">
              <ProductSkeletonGrid count={8} />
            </div>
          ) : error ? (
            <div className="place-empty-state">
              <Leaf size={44} className="place-empty-icon" />
              <h3>Unable to Load Products</h3>
              <p>{error}</p>
              <Link to="/places" className="place-back-btn">
                Return to Explore by Places
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

              {productsData && productsData.totalPages > 1 && (
                <Pagination
                  page={productsData.page}
                  totalPages={productsData.totalPages}
                  onChange={(nextPage) => {
                    updateFilters({ page: String(nextPage) });
                    document
                      .getElementById("place-products-list")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              )}
            </>
          ) : (
            <div className="place-empty-state">
              <ShoppingBag size={48} className="place-empty-icon" />
              <h3>No products found in {placeName}</h3>
              <p>
                {hasActiveFilters
                  ? "We couldn't find any products matching your specific filters. Try loosening your criteria."
                  : `Currently there are no products listed from ${placeName}. Check back soon for fresh seasonal harvests.`}
              </p>
              {hasActiveFilters ? (
                <button type="button" onClick={clearAllFilters} className="place-reset-btn">
                  Clear All Filters
                </button>
              ) : (
                <Link to="/places" className="place-back-btn">
                  Explore Other Places
                </Link>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
