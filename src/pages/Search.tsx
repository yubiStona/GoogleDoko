import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Leaf, Loader2, MapPin, Search as SearchIcon } from "lucide-react";

import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductCard from "../components/product/ProductCard";
import Pagination, {
  paginateItems,
  PLACES_PAGE_SIZE,
} from "../components/Pagination";

import { searchPlaces } from "../data/search";
import { api } from "../api/client";
import type { Product } from "../data/products";
import { useGetPlacesQuery } from "../store/api/apiSlice";

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [page, setPage] = useState(1);
  const [placesPage, setPlacesPage] = useState(1);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: serverPlaces } = useGetPlacesQuery();

  // Backend search: fires whenever query changes
  useEffect(() => {
    setPage(1);
    setPlacesPage(1);

    if (!query) {
      setApiProducts([]);
      return;
    }

    setLoading(true);
    api
      .search(query)
      .then((results) => {
        // Map DB rows to Product shape
        const mapped = results.map((r: any) => ({
          id: String(r.id),
          name: r.name,
          category: r.category,
          price: r.price,
          rating: r.rating,
          sold: r.sold,
          origin: r.origin,
          seller: r.seller,
          image: r.image,
          weight: r.weight,
          stock: r.stock,
          gallery: [r.image],
        })) as Product[];
        setApiProducts(mapped);
      })
      .catch(() => setApiProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  const matchedPlaces = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    if (serverPlaces && serverPlaces.length > 0) {
      return serverPlaces
        .map((p: any) => ({
          origin: p.origin,
          name: p.name,
          products: p.totalSold || p.productsCount || 0,
          image: p.image,
        }))
        .filter((p: any) => p.name.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q));
    }
    return searchPlaces(query);
  }, [serverPlaces, query]);
  const total = apiProducts.length + matchedPlaces.length;
  const paged = paginateItems(apiProducts, page);
  const pagedPlaces = paginateItems(matchedPlaces, placesPage, PLACES_PAGE_SIZE);

  function changePage(nextPage: number) {
    setPage(nextPage);
    document
      .querySelector(".all-products-section")
      ?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  return (
    <>
      <TopBar />
      <Navbar />

      <main className="shop-page">
        <section className="shop-banner">
          <div className="shop-banner-content">
            <span>SEARCH</span>
            <h1>
              {query
                ? `Results for "${query}"`
                : "Search products or places"}
            </h1>
            <p>
              {loading
                ? "Searching…"
                : query
                ? `${total} match${total === 1 ? "" : "es"} found`
                : "Type a product name, category, or place in the search bar."}
            </p>
          </div>
        </section>

        {matchedPlaces.length > 0 && (
          <section className="all-products-section search-places-section">
            <div className="all-products-heading">
              <h2>Places</h2>
              <p>Origins that match your search</p>
            </div>

            <div className="places-grid search-places-grid">
              {pagedPlaces.items.map((place) => (
                <Link
                  key={place.origin}
                  to={`/categories?place=${encodeURIComponent(place.origin)}`}
                  className="place-card"
                >
                  <img
                    src={place.image}
                    alt={place.name}
                    className="place-card-image"
                    onError={(e) => {
                      e.currentTarget.src = "/src/frontend/assets/images/places/ilam.jpg";
                    }}
                  />

                  <div className="place-card-overlay">
                    <div>
                      <h2>{place.name}</h2>
                      <p>
                        <MapPin size={16} />
                        {place.products} products
                      </p>
                    </div>

                    <span className="place-card-arrow" aria-hidden="true">
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination
              page={pagedPlaces.current}
              totalPages={pagedPlaces.totalPages}
              onChange={setPlacesPage}
            />
          </section>
        )}

        <section className="all-products-section">
          {loading ? (
            <div className="no-products-message">
              <Loader2 size={40} className="spin" />
              <h3>Searching…</h3>
              <p>Looking for "{query}" in our product catalog.</p>
            </div>
          ) : apiProducts.length > 0 ? (
            <>
              <div className="all-products-heading">
                <h2>Products</h2>
                <p>Items that match your search</p>
              </div>

              <div className="categories-products-grid">
                {paged.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination
                page={paged.current}
                totalPages={paged.totalPages}
                onChange={changePage}
              />
            </>
          ) : query && matchedPlaces.length === 0 ? (
            <div className="no-products-message">
              <SearchIcon size={40} />
              <h3>No results for "{query}"</h3>
              <p>
                Try another product name or place, such as Apple, Honey, or Ilam.
              </p>
              <Link to="/shop">View all products</Link>
            </div>
          ) : !query ? (
            <div className="no-products-message">
              <Leaf size={40} />
              <h3>Start a search</h3>
              <p>Use the search bar above to find products or places.</p>
              <Link to="/shop">Browse products</Link>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Search;
