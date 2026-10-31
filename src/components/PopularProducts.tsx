import ProductCard from "./product/ProductCard";
import { type Product } from "../data/products";
import { Link } from "react-router-dom";
import { useGetPopularProductsQuery } from "../store/api/apiSlice";
import { ProductSkeletonGrid } from "./product/ProductSkeleton";

function PopularProducts() {
  const { data: serverProducts, isLoading } = useGetPopularProductsQuery(4);
  const displayProducts = (serverProducts || []) as unknown as Product[];

  return (
    <section className="popular-products-section">
      <div className="section-header">
        <h2>Most Popular Items</h2>
        <Link to="/shop" className="section-view-all">
          View all
        </Link>
      </div>

      <div className="products-grid">
        {isLoading ? (
          <ProductSkeletonGrid count={4} />
        ) : (
          displayProducts.slice(0, 4).map((product) => (
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