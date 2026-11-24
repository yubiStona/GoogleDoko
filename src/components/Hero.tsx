import { MapPin, Leaf, Truck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function Hero({ content = {} }: { content?: Record<string, string> }) {
  return (
    <section className="hero-section">
      <div className="hero-content">

        {/* Left Content */}
        <div className="hero-text">
          <p className="hero-kicker">{content.eyebrow || "From local places across Nepal"}</p>

          <h1>
            {content.title || "Discover authentic products from their original places."}
          </h1>

          <p>
            {content.description || "Shop fresh fruits, vegetables, groceries and discover authentic local products from trusted sellers."}
          </p>

          {/* Buttons */}
          <div className="hero-buttons">

            <Link to="/shop" className="primary-button">
              {content.primaryButton || "Shop Now"}
            </Link>

            <Link to="/places" className="secondary-button">
              <MapPin size={20} className="hero-btn-icon" />
              {content.secondaryButton || "Explore Local Places"}
            </Link>

          </div>

          {/* Benefits */}
          <div className="hero-benefits">

            <div className="hero-benefit">
              <div className="benefit-icon green">
                <Leaf size={18} />
              </div>

              <div>
                <strong>100% Fresh</strong>
                <span>Quality you can trust</span>
              </div>
            </div>

            <div className="hero-benefit">
              <div className="benefit-icon orange">
                <Truck size={18} />
              </div>

              <div>
                <strong>Fast Delivery</strong>
                <span>Quick and reliable</span>
              </div>
            </div>

            <div className="hero-benefit">
              <div className="benefit-icon green">
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong>Secure Payment</strong>
                <span>Safe and protected</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Image */}
        <div className="hero-image">
          <img
            src={content.image || "/src/frontend/assets/images/hero-vegetables.png"}
            alt={content.imageAlt || "Fresh vegetables in a basket"}
          />
        </div>

      </div>
    </section>
  );
}

export default Hero;