import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useCart } from "../context/CartContext";
import "../styles/landing.css";

import landingHeroFull from "../assets/images/landing/landing-hero-full.jpg";

export default function LandingPage() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleExploreFood = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/food");
  };

  const handleExploreLifestyle = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowComingSoon(true);
  };

  const scrollToCards = () => {
    window.scrollTo({
      top: window.innerHeight * 0.4,
      behavior: "smooth",
    });
  };

  return (
    <div className="landing-page-root">
      {/* 16:9 Canvas matching master artwork with 100% precision */}
      <div className="landing-canvas-container">
        <div className="landing-canvas-inner">
          {/* Pristine Master Artwork from Screenshot 2 */}
          <img
            src={landingHeroFull}
            alt="GoogleDoko - Welcome to GoogleDoko. Discover, Shop, Enjoy."
            className="landing-canvas-artwork"
          />

          {/* Real HTML Header (Selectable text + Interactive links) */}
          <header className="landing-canvas-header">
            {/* Logo */}
            <Link
              to="/"
              className="landing-canvas-logo-link"
              aria-label="GoogleDoko Home"
              title="GoogleDoko Home"
            >
              <span className="landing-selectable-text">GoogleDoko</span>
            </Link>

            {/* Nav Navigation Links */}
            <nav className="landing-canvas-nav" aria-label="Main Navigation">
              <Link
                to="/"
                className="landing-nav-link-item landing-nav-home active"
                aria-label="Home"
                title="Home"
              >
                <span className="landing-selectable-text">Home</span>
              </Link>
              <Link
                to="/about"
                className="landing-nav-link-item landing-nav-about"
                aria-label="About"
                title="About"
              >
                <span className="landing-selectable-text">About</span>
              </Link>
              <Link
                to="/support"
                className="landing-nav-link-item landing-nav-contact"
                aria-label="Contact"
                title="Contact"
              >
                <span className="landing-selectable-text">Contact</span>
              </Link>
            </nav>

            {/* Header Right Actions */}
            <div className="landing-canvas-actions">
              <Link
                to="/search"
                className="landing-action-icon-link landing-action-search"
                aria-label="Search items"
                title="Search"
              >
                <span className="sr-only">Search</span>
              </Link>

              <Link
                to="/cart"
                className="landing-action-icon-link landing-action-cart"
                aria-label={`Shopping cart with ${cartCount} items`}
                title="Cart"
              >
                <span className="sr-only">Cart</span>
                {cartCount > 0 && (
                  <span className="landing-cart-dynamic-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </header>

          {/* Central Headline Area (Real HTML Selectable Text) */}
          <div className="landing-headline-overlay">
            <div className="landing-top-tagline">
              <span className="landing-selectable-text">Discover · Shop · Enjoy</span>
            </div>
            <h1 className="landing-main-title">
              <span className="landing-selectable-text">
                Welcome to Google<span className="landing-title-doko">Doko</span>
              </span>
            </h1>
            <p className="landing-sub-tagline">
              <span className="landing-selectable-text">
                Good Food. Better Choices. Local Love. ♡
              </span>
            </p>
          </div>

          {/* Left Food Card (Clickable Area + Real HTML Text & Button) */}
          <div
            className="landing-food-card-overlay"
            role="button"
            tabIndex={0}
            onClick={handleExploreFood}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/food");
              }
            }}
            aria-label="Explore Food from local places"
            title="Explore Food from local places"
          >
            <div className="landing-food-text-block">
              <div className="landing-food-word">
                <span className="landing-selectable-text">Food</span>
              </div>
              <div className="landing-food-subtitle">
                <span className="landing-selectable-text">From Local Places</span>
              </div>
              <p className="landing-food-desc">
                <span className="landing-selectable-text">
                  Explore local restaurants, traditional dishes and more.
                </span>
              </p>
            </div>

            <button
              type="button"
              className="landing-btn-food"
              data-testid="explore-food-btn"
              onClick={handleExploreFood}
              aria-label="Explore Food"
            >
              <span className="landing-selectable-text">Explore Food</span>
            </button>
          </div>

          {/* Right Lifestyle Card (Clickable Area + Real HTML Text & Button) */}
          <div
            className="landing-lifestyle-card-overlay"
            role="button"
            tabIndex={0}
            onClick={handleExploreLifestyle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowComingSoon(true);
              }
            }}
            aria-label="Explore Lifestyle and artisanal goods"
            title="Explore Lifestyle"
          >
            <div className="landing-lifestyle-text-block">
              <div className="landing-lifestyle-word">
                <span className="landing-selectable-text">Lifestyle</span>
              </div>
              <div className="landing-lifestyle-subtitle">
                <span className="landing-selectable-text">Live Better, Locally</span>
              </div>
              <p className="landing-lifestyle-desc">
                <span className="landing-selectable-text">
                  Explore fashion, handicrafts, home decor and everyday products.
                </span>
              </p>
            </div>

            <button
              type="button"
              className="landing-btn-lifestyle"
              data-testid="explore-lifestyle-btn"
              onClick={handleExploreLifestyle}
              aria-label="Explore Lifestyle"
            >
              <span className="landing-selectable-text">Explore Lifestyle</span>
            </button>
          </div>

          {/* Scroll Down Button */}
          <button
            type="button"
            className="landing-scroll-button"
            onClick={scrollToCards}
            aria-label="Scroll down to explore"
            title="Scroll Down"
          >
            <span className="landing-selectable-text">Scroll Down</span>
          </button>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div
          className="landing-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className="landing-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="landing-modal-close"
              onClick={() => setShowComingSoon(false)}
              aria-label="Close notification"
            >
              <X size={20} />
            </button>

            <h3 id="modal-title" className="landing-modal-title">
              Coming Soon
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
