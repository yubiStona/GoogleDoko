import ProductCard from "./product/ProductCard";
import { products as fallbackFoodProducts, type Product } from "../data/products";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useGetPopularProductsQuery } from "../store/api/apiSlice";
import { ProductSkeletonGrid } from "./product/ProductSkeleton";
import { useSideScroll } from "../hooks/useSideScroll";

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

function PopularProducts() {
  const { data: serverProducts, isLoading } = useGetPopularProductsQuery(8);
  const rawList = Array.isArray(serverProducts)
    ? serverProducts
    : Array.isArray((serverProducts as unknown as { data?: unknown })?.data)
    ? ((serverProducts as unknown as { data: unknown[] }).data)
    : [];

  const filteredFoodProducts = (rawList as unknown as Product[]).filter(isFoodProduct);
  const displayProducts =
    filteredFoodProducts.length > 0
      ? filteredFoodProducts
      : !isLoading && rawList.length > 0
      ? fallbackFoodProducts.slice(0, 8)
      : filteredFoodProducts;

  const { scrollRef, scrollRight } = useSideScroll();

  return (
    <section className="popular-products-section" aria-labelledby="popular-products-heading">
      <div className="section-header">
        <div>
          <h2 id="popular-products-heading">Most Popular Items</h2>
          <p className="section-subheading">
            Handpicked bestsellers loved by our community
          </p>
        </div>

        <div className="section-header-actions">
          <Link to="/shop" className="section-view-all">
            View all
          </Link>
          <button
            type="button"
            onClick={scrollRight}
            className="section-scroll-next-btn"
            aria-label="Next popular products"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="products-grid products-side-scroll-track" ref={scrollRef}>
        {isLoading ? (
          <ProductSkeletonGrid count={4} />
        ) : (
          displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default PopularProducts;
