import ProductCard from "./product/ProductCard";
import { type Product } from "../data/products";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useGetPopularProductsQuery } from "../store/api/apiSlice";
import { ProductSkeletonGrid } from "./product/ProductSkeleton";
import { useSideScroll } from "../hooks/useSideScroll";

function PopularProducts() {
  const { data: serverProducts, isLoading } = useGetPopularProductsQuery(8);
  const displayProducts = (serverProducts || []) as unknown as Product[];
  const { scrollRef, scrollRight } = useSideScroll();

  return (
    <section className="popular-products-section" aria-labelledby="popular-products-heading">
      <div className="section-header">
        <h2 id="popular-products-heading">Most Popular Items</h2>

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