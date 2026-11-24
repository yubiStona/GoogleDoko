import { ArrowLeft, ArrowRight, Leaf, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { LandingBrand } from "./LandingPage";
import { useGetLandingPageContentQuery } from "../store/api/hero";
import "../styles/landing.css";

export default function LifestyleComingSoon() {
  const { data } = useGetLandingPageContentQuery();
  const lifestyleImage = data?.lifestyle.image || "/landing-assets/lifestyle-card-scene.jpg";

  return (
    <main className="lifestyle-coming-page">
      <header className="coming-header">
        <LandingBrand />
        <Link to="/" className="coming-home-link"><ArrowLeft size={16} /> Back to home</Link>
      </header>

      <section className="coming-card" aria-labelledby="coming-title">
        <div className="coming-copy">
          <span className="coming-kicker"><Sparkles size={15} /> A new local collection</span>
          <p className="coming-overline">GOOGLEDOKO LIFESTYLE</p>
          <h1 id="coming-title">Lovely local finds are on their way.</h1>
          <p className="coming-description">
            We’re gathering thoughtful pieces from Nepalese makers. While we get the collection ready, there’s plenty of goodness to discover in our food market.
          </p>
          <Link to="/food" className="coming-food-button">
            Let’s explore food for now <ArrowRight size={18} />
          </Link>
          <span className="coming-note"><Leaf size={14} /> Fresh picks, from local places across Nepal</span>
        </div>
        <div className="coming-image-wrap">
          <img src={lifestyleImage} alt={data?.lifestyle.imageAlt || "Colorful locally made bag and home goods"} />
          <span className="coming-image-label">Made with local love</span>
        </div>
      </section>
      <div className="coming-bottom-line"><span /> SUPPORT LOCAL · SHOP LOCAL · GROW TOGETHER <span /></div>
    </main>
  );
}
