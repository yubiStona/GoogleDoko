import { ArrowDown, ArrowRight, ArrowUpRight, Heart, Leaf, Search, ShoppingBag, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type PublicLandingContent } from "../api/client";
import { useCart } from "../context/CartContext";
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
  const [data, setData] = useState<PublicLandingContent | null>(null);
  useEffect(() => {
    let active = true;
    const load = () => api.getPublicLandingContent().then((content) => { if (active) setData(content); }).catch(() => undefined);
    void load();
    const timer = window.setInterval(load, 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const section = (key: string, fallback: Record<string, string>) => data?.sections?.[key] || fallback;
  const specials = section("special_offers", { title: "Special offers", description: "Seasonal picks and offers from local sellers.", image: "", button: "Explore offers", href: "/shop" });
  const how = section("how_it_works", { title: "How GoogleDoko works", description: "Shop local in a few simple steps.", step1Title: "Discover", step1Description: "Explore food and local places.", step2Title: "Choose", step2Description: "Pick products from trusted sellers.", step3Title: "Enjoy", step3Description: "Get your order delivered." });
  const why = section("why_choose_us", { title: "Why choose GoogleDoko", description: "Good food, local makers, and thoughtful service.", item1Title: "Local first", item1Description: "Support producers across Nepal.", item2Title: "Chosen with care", item2Description: "Discover authentic local goods.", item3Title: "At your door", item3Description: "Simple delivery and support." });
  const promo = section("promo", { title: "A little more local", description: "Discover what is fresh and special this week.", image: "", button: "Shop now", href: "/shop" });
  const footer = section("footer", { aboutTitle: "About GoogleDoko", aboutText: "Discover fresh, authentic and locally sourced products from across Nepal.", location: "Kathmandu, Nepal", phone: "+977 111-111-111", email: "support@googledoko.com", privacyLabel: "Privacy Policy", termsLabel: "Terms & Conditions" });
  const contentSectionOrder = ["special_offers", "how_it_works", "why_choose_us", "promo"].sort((a, b) => (page.displayOrder?.[a] ?? 99) - (page.displayOrder?.[b] ?? 99));

  const page = data ?? {
    eyebrow: "Good food. Better choices. Local love.",
    title: "Welcome to GoogleDoko",
    description: "Discover local food and lifestyle products, all in one place.",
    backgroundImage: "/landing-assets/landing-background.jpg",
    food: {
      eyebrow: "Fresh from Nepal", title: "Food with a place of origin.",
      description: "Shop farm fresh produce and traditional favourites from local growers.",
      button: "Explore food", image: "/landing-assets/food-card-scene.jpg",
      imageAlt: "Traditional Nepali food with a Himalayan hillside and temple", href: "/food",
    },
    lifestyle: {
      eyebrow: "Made to be lived with", title: "Bring local craft into your home.",
      description: "Find thoughtful home, fashion, and handmade goods from Nepalese makers.",
      button: "Explore lifestyle", image: "/landing-assets/lifestyle-card-scene.jpg",
      imageAlt: "Nepali handcrafted bag and home goods beside a mountain view", href: "/lifestyle-coming-soon",
    },
  };

  return (
    <main
      className="landing-page"
      style={{ "--landing-backdrop": `url("${page.backgroundImage}")` } as CSSProperties & { "--landing-backdrop": string }}
    >
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

      {(page.visibility?.hero ?? 1) !== 0 && <section className="landing-intro" aria-labelledby="landing-title">
        <div className="landing-intro-copy">
          <p className="landing-script-tagline"><span />{page.eyebrow}<span /></p>
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
      </section>}

      <section className="landing-explore" id="explore" aria-label="Choose what to explore">
        {([
          ...(page.visibility?.food === 0 ? [] : [{ key: "food", data: page.food, style: "landing-choice-food" }]),
          ...(page.visibility?.lifestyle === 0 ? [] : [{ key: "lifestyle", data: page.lifestyle, style: "landing-choice-lifestyle" }]),
        ]).sort((a, b) => (page.displayOrder?.[a.key] ?? 0) - (page.displayOrder?.[b.key] ?? 0)).map(({ key, data: choice, style }) => <Link key={key} to={choice.href} className={`landing-choice ${style}`}>
          <img src={choice.image} alt={choice.imageAlt} className="landing-choice-image" />
          <span className="landing-choice-shade" />
          <span className="landing-choice-content">
            <span className="landing-choice-eyebrow">{key === "food" ? <Leaf size={15} /> : <Sparkles size={15} />} {choice.eyebrow}</span>
            <strong className="landing-choice-title">{choice.title}</strong>
            <span className="landing-choice-description">{choice.description}</span>
            <span className="landing-choice-button">{choice.button}<ArrowRight size={17} /></span>
          </span>
          <span className="landing-choice-corner"><ArrowUpRight size={19} /></span>
        </Link>)}
      </section>

      {contentSectionOrder.map((sectionKey) => {
        if (sectionKey === "why_choose_us") return page.visibility?.why_choose_us === 0 ? null : <section key={sectionKey} className="landing-why-section" aria-label="Why shop GoogleDoko">
        <div className="landing-why-heading"><p className="landing-section-kicker">Local by nature</p><h2>{why.title}</h2><p>{why.description}</p></div>
        <div className="landing-promise">
        <div><span className="landing-promise-icon"><Leaf size={19} /></span><span><strong>{why.item1Title}</strong><small>{why.item1Description}</small></span></div>
        <span className="landing-promise-divider" />
        <div><span className="landing-promise-icon warm"><Heart size={19} /></span><span><strong>{why.item2Title}</strong><small>{why.item2Description}</small></span></div>
        <span className="landing-promise-divider" />
        <div><span className="landing-promise-icon gold"><ShoppingBag size={19} /></span><span><strong>{why.item3Title}</strong><small>{why.item3Description}</small></span></div>
        </div>
      </section>;
        if (sectionKey === "special_offers") return page.visibility?.special_offers === 0 ? null : <section key={sectionKey} className="landing-content-section landing-offers" aria-label="Special offers" style={specials.image ? { backgroundImage: `linear-gradient(90deg, rgba(255,253,246,.96), rgba(255,253,246,.68)), url("${specials.image}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        <div><p className="landing-section-kicker">Handpicked for you</p><h2>{specials.title}</h2><p>{specials.description}</p></div>
        <Link className="landing-content-button" to={specials.href}>{specials.button}<ArrowRight size={17} /></Link>
      </section>;
        if (sectionKey === "how_it_works") return page.visibility?.how_it_works === 0 ? null : <section key={sectionKey} className="landing-content-section landing-how" aria-label="How it works">
        <p className="landing-section-kicker">Easy as 1, 2, 3</p><h2>{how.title}</h2><p>{how.description}</p>
        <div className="landing-steps">{[1, 2, 3].map((n) => <article key={n}><span>0{n}</span><h3>{how[`step${n}Title`]}</h3><p>{how[`step${n}Description`]}</p></article>)}</div>
      </section>;
        return page.visibility?.promo === 0 ? null : <section key={sectionKey} className="landing-promo" style={promo.image ? { backgroundImage: `linear-gradient(90deg, rgba(13,50,33,.88), rgba(13,50,33,.16)), url("${promo.image}")` } : undefined}>
        <div><p className="landing-section-kicker">From Nepal, with care</p><h2>{promo.title}</h2><p>{promo.description}</p><Link className="landing-content-button" to={promo.href}>{promo.button}<ArrowRight size={17} /></Link></div>
      </section>;
      })}

      {page.visibility?.footer !== 0 && <footer className="landing-footer"><LandingBrand /><span>{footer.aboutText}</span><span>{footer.location} · {footer.phone} · {footer.email}</span><span><Link to="/pages/privacy">{footer.privacyLabel}</Link> · <Link to="/pages/terms">{footer.termsLabel}</Link></span></footer>}
    </main>
  );
}
