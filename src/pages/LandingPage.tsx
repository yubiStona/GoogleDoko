import { ArrowDown, ArrowRight, ArrowUpRight, Heart, Leaf, Search, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useGetLandingPageContentQuery } from "../store/api/hero";
import "../styles/landing.css";

export function LandingBrand() {
  return (
    <Link to="/" className="landing-brand" aria-label="GoogleDoko home">
      <span className="landing-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <path d="M12.5 17.5h23l2.3 24H10.2l2.3-24Z" fill="currentColor" />
          <path d="M18 18v-4.2a6 6 0 0 1 12 0V18" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M24.4 34.4c-5.2-4.2-5.3-8.5-2.1-10.5 2.4-1.5 4.4.5 4.4.5s1.9-2.2 4.4-.8c3.1 1.9 2.3 6.2-2.8 10.8l-2 1.7-1.9-1.7Z" fill="#f7a01b" />
          <path d="M25.3 33.6c-.5-4.2.6-7 3.6-9.1" fill="none" stroke="#17623e" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </span>
      <span className="landing-brand-copy">
        <strong>Google<span>Doko</span></strong>
        <small>GOOD FOOD · LOCAL LIVING</small>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  const { cartItems } = useCart();
  const { data } = useGetLandingPageContentQuery();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const page = data ?? {
    eyebrow: "Good things, from close to home",
    title: "Welcome to GoogleDoko",
    description: "Discover local food and lifestyle products, all in one place.",
    food: {
      eyebrow: "Fresh from Nepal", title: "Food with a place of origin.",
      description: "Shop farm fresh produce and traditional favourites from local growers.",
      button: "Explore food", image: "/landing-assets/food-photo.jpg",
      imageAlt: "Traditional Nepalese momo served with dipping sauce", href: "/food",
    },
    lifestyle: {
      eyebrow: "Made to be lived with", title: "Bring local craft into your home.",
      description: "Find thoughtful home, fashion, and handmade goods from Nepalese makers.",
      button: "Explore lifestyle", image: "/landing-assets/lifestyle-photo.jpg",
      imageAlt: "Colorful locally made bag and home goods", href: "/lifestyle-coming-soon",
    },
  };

  return (
    <main className="landing-page">
      <header className="landing-header">
        <LandingBrand />
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#explore">Explore</a>
          <Link to="/about">Our story</Link>
          <Link to="/support">Contact</Link>
        </nav>
        <div className="landing-header-actions">
          <Link to="/search" className="landing-icon-action" aria-label="Search"><Search size={19} /></Link>
          <Link to="/cart" className="landing-icon-action landing-cart-action" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingBag size={19} />{cartCount > 0 && <span>{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>
          <Link to="/login" className="landing-login">Sign in</Link>
        </div>
      </header>

      <section className="landing-intro" aria-labelledby="landing-title">
        <div className="landing-intro-copy">
          <p className="landing-eyebrow"><Leaf size={15} /> {page.eyebrow}</p>
          <h1 id="landing-title">
            {page.title.split("GoogleDoko").map((part, index, pieces) => (
              <span key={`${part}-${index}`}>
                {part}{index < pieces.length - 1 && <span className="landing-title-brand">Google<span>Doko</span></span>}
              </span>
            ))}
          </h1>
          <p className="landing-intro-description">{page.description}</p>
        </div>
        <a className="landing-scroll-cue" href="#explore"><span>Discover your Doko</span><ArrowDown size={17} /></a>
      </section>

      <section className="landing-explore" id="explore" aria-label="Choose what to explore">
        <Link to={page.food.href} className="landing-choice landing-choice-food">
          <img src={page.food.image} alt={page.food.imageAlt} className="landing-choice-image" />
          <span className="landing-choice-shade" />
          <span className="landing-choice-content">
            <span className="landing-choice-eyebrow"><Leaf size={15} /> {page.food.eyebrow}</span>
            <strong className="landing-choice-title">{page.food.title}</strong>
            <span className="landing-choice-description">{page.food.description}</span>
            <span className="landing-choice-button">{page.food.button}<ArrowRight size={17} /></span>
          </span>
          <span className="landing-choice-corner"><ArrowUpRight size={19} /></span>
        </Link>

        <Link to={page.lifestyle.href} className="landing-choice landing-choice-lifestyle">
          <img src={page.lifestyle.image} alt={page.lifestyle.imageAlt} className="landing-choice-image" />
          <span className="landing-choice-shade" />
          <span className="landing-choice-content">
            <span className="landing-choice-eyebrow"><Sparkles size={15} /> {page.lifestyle.eyebrow}</span>
            <strong className="landing-choice-title">{page.lifestyle.title}</strong>
            <span className="landing-choice-description">{page.lifestyle.description}</span>
            <span className="landing-choice-button">{page.lifestyle.button}<ArrowRight size={17} /></span>
          </span>
          <span className="landing-choice-corner"><ArrowUpRight size={19} /></span>
        </Link>
      </section>

      <section className="landing-promise" aria-label="Why shop GoogleDoko">
        <div><span className="landing-promise-icon"><Leaf size={19} /></span><span><strong>Rooted in Nepal</strong><small>Local producers, real stories</small></span></div>
        <span className="landing-promise-divider" />
        <div><span className="landing-promise-icon warm"><Heart size={19} /></span><span><strong>Chosen with care</strong><small>Thoughtful finds for everyday life</small></span></div>
        <span className="landing-promise-divider" />
        <div><span className="landing-promise-icon gold"><ShoppingBag size={19} /></span><span><strong>One doko, two worlds</strong><small>Fresh food and local lifestyle</small></span></div>
      </section>

      <footer className="landing-footer"><LandingBrand /><span>Good food. Better choices. Local love.</span></footer>
    </main>
  );
}
