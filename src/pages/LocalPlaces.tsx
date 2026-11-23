import { useMemo, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Pagination, {
  paginateItems,
  PLACES_PAGE_SIZE,
} from "../components/Pagination";

import { useGetPlacesQuery, useGetProductsQuery } from "../store/api/apiSlice";

const placeImages = import.meta.glob("../assets/images/places/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function placeImage(origin: string) {
  const slug = origin.split(",")[0].trim().toLowerCase().replace(/\s+/g, "-");
  return (
    placeImages[`../assets/images/places/${slug}.jpg`] ||
    placeImages["../assets/images/places/ilam.jpg"] ||
    "/src/frontend/assets/images/places/ilam.jpg"
  );
}

function LocalPlaces() {
  const [page, setPage] = useState(1);
  const {
    data: serverPlaces,
    isLoading: placesLoading,
    isError: placesError,
    refetch: refetchPlaces,
  } = useGetPlacesQuery();
  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useGetProductsQuery();

  const places = useMemo(() => {
    if (serverPlaces && serverPlaces.length > 0) {
      return serverPlaces.map((p: any) => ({
        id: p.id || p.origin.split(",")[0].trim().toLowerCase(),
        origin: p.origin,
        name: p.name,
        products: p.itemCount ?? p.productsCount ?? 0,
        sold: p.soldCount ?? p.totalSold ?? 0,
        description: p.description || "",
        image: placeImage(p.origin),
      }));
    }

    // Product origins are the source of truth in the database. If the places
    // summary endpoint is empty or unavailable, still build the directory from
    // the active products returned by /products.
    const byPlace = new Map<string, { name: string; count: number; sold: number }>();
    for (const product of products || []) {
      const name = product.origin?.split(",")[0]?.trim();
      if (!name) continue;
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const place = byPlace.get(id) || { name, count: 0, sold: 0 };
      place.count += 1;
      const soldCount = Number.parseInt(String(product.sold || "0"), 10);
      place.sold += Number.isFinite(soldCount) ? soldCount : 0;
      byPlace.set(id, place);
    }

    return Array.from(byPlace, ([id, place]) => ({
      id,
      name: place.name,
      origin: place.name,
      products: place.count,
      sold: place.sold,
      description: `Explore authentic products from ${place.name}.`,
      image: placeImage(place.name),
    }));
  }, [serverPlaces, products]);

  const isLoading = placesLoading || productsLoading;
  const hasLoadError = placesError && productsError;

  const paged = paginateItems(places, page, PLACES_PAGE_SIZE);

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
            <span>EXPLORE LOCAL PLACES</span>
            <h1>Discover authentic products from their original places</h1>
            <p>
              Visit trusted farms and local sellers, then shop the
              products grown in each place.
            </p>
          </div>
        </section>

        <section className="all-products-section">
          <div className="all-products-heading">
            <h2>All Places</h2>
            <p>Explore authentic local regions and their specialties</p>
          </div>

          <div className="places-grid">
            {paged.items.map((place) => (
              <Link
                key={place.origin}
                to={`/places/${place.id}`}
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

          {isLoading && places.length === 0 && (
            <p role="status" className="places-load-message">Loading places from local products…</p>
          )}
          {!isLoading && places.length === 0 && (
            <div role="status" className="places-load-message">
              <p>{hasLoadError ? "Places could not be loaded right now." : "No places with active products were found."}</p>
              {hasLoadError && (
                <button type="button" onClick={() => { refetchPlaces(); refetchProducts(); }}>
                  Try again
                </button>
              )}
            </div>
          )}

          <Pagination
            page={paged.current}
            totalPages={paged.totalPages}
            onChange={changePage}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}

export default LocalPlaces;
