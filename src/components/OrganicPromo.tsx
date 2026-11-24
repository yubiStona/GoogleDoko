import { Link } from "react-router-dom";

function OrganicPromo({ content = {} }: { content?: Record<string, string> }) {
  return (
    <section className="organic-promo-section">
      <div className="organic-promo-container">
        {/* Left Side - Vegetables */}
        <div className="organic-promo-image-area">
          <div className="organic-promo-circle"></div>

          <img
            src={content.image || "/src/frontend/assets/images/organic-vegetables.jpg"}
            alt="Fresh organic vegetables"
            className="organic-promo-image"
          />

          <div className="organic-promo-discount">
            <span>Up to</span>
            <strong>30% off</strong>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="organic-promo-content">
          <h2>{content.title || "Fresh and Organic Vegetables Every Day"}</h2>

          <h3>
            {content.subtitle || "Healthy and fresh products, delivered directly to your doorstep."}
          </h3>

          <p>
            {content.description || "Discover fresh vegetables and quality agricultural products from trusted local farmers. We carefully select our products to provide you with healthy, natural, and affordable choices for your everyday needs."}
          </p>

          <Link
            to="/categories?category=Vegetables"
            className="organic-promo-button"
          >
            {content.button || "Shop Now"}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OrganicPromo;
