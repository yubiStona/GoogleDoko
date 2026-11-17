import { useMemo, useState } from "react";

import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import ProductCard from "../components/product/ProductCard";
import Footer from "../components/layout/Footer";
import Pagination, {
  paginateItems,
} from "../components/Pagination";

import { type Product } from "../data/products";
import { useGetProductsQuery } from "../store/api/apiSlice";
import { ProductSkeletonGrid } from "../components/product/ProductSkeleton";

const LIFESTYLE_CATEGORY_NAMES = new Set([
  "furniture",
  "home & living",
  "home-living",
  "kitchen & dining",
  "kitchen-dining",
  "garden & outdoor",
  "garden-outdoor",
  "beauty & personal care",
  "beauty & skincare",
  "beauty-personal-care",
  "fashion & accessories",
  "fashion-accessories",
  "fashion",
  "clothing",
  "bags",
  "shoes",
  "home decor",
  "bedsheets",
]);

function isFoodProduct(product: Product): boolean {
  if (!product) return false;
  const anyP = product as unknown as { lifestyleId?: string };
  if (anyP.lifestyleId || /^PROD-(FURN|HOME|KITCH|GARD|BEAU|FASH)/i.test(product.id)) {
    return false;
  }
  const category = (product.category || "").trim().toLowerCase();
  if (LIFESTYLE_CATEGORY_NAMES.has(category)) {
    return false;
  }
  return true;
}

function Shop() {
  const [page, setPage] = useState(1);
  const { data: serverProducts, isLoading, isError, refetch } = useGetProductsQuery();
  const allProducts = useMemo(() => {
    return ((serverProducts || []) as unknown as Product[]).filter(isFoodProduct);
  }, [serverProducts]);
  const paged = paginateItems(allProducts, page);

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
            <span>SHOP NOW</span>
            <h1>Fresh products from trusted local sellers</h1>
            <p>
              Browse all available items and order authentic food
              from their original places.
            </p>
          </div>
        </section>

        <section className="all-products-section">
          <div className="all-products-heading">
            <h2>All Products</h2>
            <p>Fresh products, better living</p>
          </div>

          {isLoading ? (
            <div className="categories-products-grid">
              <ProductSkeletonGrid count={8} />
            </div>
          ) : isError ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "#ef4444", marginBottom: "16px", fontWeight: 500 }}>
                Unable to load products from server.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="auth-btn"
                style={{ width: "auto", padding: "8px 24px", margin: "0 auto" }}
              >
                Retry
              </button>
            </div>
          ) : allProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "#6b7280" }}>No products available right now.</p>
            </div>
          ) : (
            <>
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
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Shop;
