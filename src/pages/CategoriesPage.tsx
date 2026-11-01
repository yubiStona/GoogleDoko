import { useEffect, useMemo, useState } from "react";
import { Leaf } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import ProductCard from "../components/product/ProductCard";
import Footer from "../components/layout/Footer";
import Pagination, { paginateItems } from "../components/Pagination";

import { type Product } from "../data/products";
import { useGetProductsQuery, useGetCategoriesQuery } from "../store/api/apiSlice";
import { ProductSkeletonGrid } from "../components/product/ProductSkeleton";
import categoriesHeroBanner from "../assets/images/categories/categories-hero-banner.png";
import categoryBottomPromo from "../assets/images/categories/category-bottom-promo.png";

const defaultCategoryOptions = [
    "All",
    "Fruits",
    "Vegetables",
    "Spices",
    "Dairy & Eggs",
    "Grains",
    "Honey",
];

function CategoriesPage() {
    const [searchParams] = useSearchParams();
    const categoryFromUrl = searchParams.get("category");
    const placeFromUrl = searchParams.get("place");

    const { data: serverProducts, isLoading } = useGetProductsQuery();
    const { data: serverCategories } = useGetCategoriesQuery();

    const categoryOptions = useMemo(() => {
        if (serverCategories && serverCategories.length > 0) {
            return ["All", ...serverCategories.map((c: any) => c.name)];
        }
        return defaultCategoryOptions;
    }, [serverCategories]);

    const allProducts = (serverProducts || []) as unknown as Product[];

    const [selectedCategory, setSelectedCategory] = useState<string>(
        categoryFromUrl || "All"
    );
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [categoryFromUrl]);

    useEffect(() => {
        setPage(1);
    }, [placeFromUrl, selectedCategory]);

    const filteredProducts = useMemo(() => {
        const byPlace = placeFromUrl
            ? allProducts.filter((product) => product.origin === placeFromUrl)
            : allProducts;

        if (selectedCategory === "All") {
            return byPlace;
        }

        return byPlace.filter(
            (product) => product.category === selectedCategory,
        );
    }, [allProducts, placeFromUrl, selectedCategory]);

    const paged = paginateItems(filteredProducts, page);

    function changePage(nextPage: number) {
        setPage(nextPage);
        document
            .querySelector(".all-products-section")
            ?.scrollIntoView({ behavior: "auto", block: "start" });
    }

    function chooseCategory(category: string) {
        setSelectedCategory(category);
        setPage(1);
    }

    return (
        <>
            <TopBar />
            <Navbar />

            <main className="shop-page">
                {/* Hero Banner */}
                {placeFromUrl ? (
                    <section className="shop-banner">
                        <div className="shop-banner-content">
                            <span>ORIGIN: {placeFromUrl.toUpperCase()}</span>
                            <h1>
                                Products from {placeFromUrl.split(",")[0].trim()}
                            </h1>
                            <p>
                                Browse authentic items and local harvests sourced directly from {placeFromUrl}.
                            </p>
                        </div>
                    </section>
                ) : (
                    <section className="categories-hero-banner-section">
                        <div className="categories-hero-banner-container">
                            <img
                                src={categoriesHeroBanner}
                                alt="Our Categories - Fresh Choices for a Healthier You"
                                className="categories-hero-banner-img"
                            />
                        </div>
                    </section>
                )}

                {/* Category Filter */}
                {!placeFromUrl && (
                    <section className="category-filter-section">
                        <div className="category-filter">
                            {categoryOptions.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    className={
                                        selectedCategory === category
                                            ? "category-filter-button active"
                                            : "category-filter-button"
                                    }
                                    onClick={() => chooseCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Products Section */}
                <section className="all-products-section">
                    <div className="all-products-heading">
                        <h2>
                            {placeFromUrl
                                ? placeFromUrl.split(",")[0].trim()
                                : selectedCategory === "All"
                                    ? "All Products"
                                    : selectedCategory}
                        </h2>

                        <p>
                            {placeFromUrl
                                ? `Products from ${placeFromUrl}`
                                : "Fresh products, better living"}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="categories-products-grid">
                            <ProductSkeletonGrid count={8} />
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <>
                            <div className="categories-products-grid">
                                {paged.items.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>

                            <Pagination
                                page={paged.current}
                                totalPages={paged.totalPages}
                                onChange={changePage}
                            />
                        </>
                    ) : (
                        <div className="no-products-message">
                            <Leaf size={40} />
                            <h3>No products available yet</h3>
                            <p>
                                Products from this category will be added soon.
                            </p>
                            <button
                                type="button"
                                onClick={() => chooseCategory("All")}
                            >
                                View all products
                            </button>
                        </div>
                    )}
                </section>

                {/* Bottom Promo Banner */}
                {!placeFromUrl && (
                    <section className="category-bottom-promo-section">
                        <div className="category-bottom-promo-container">
                            <Link
                                to="/shop"
                                className="category-bottom-promo-card"
                                aria-label="Fresh Products Better Living - Buy Now"
                            >
                                <img
                                    src={categoryBottomPromo}
                                    alt="Fresh Products Better Living - Buy Now"
                                    className="category-bottom-promo-img"
                                />
                            </Link>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </>
    );
}

export default CategoriesPage;