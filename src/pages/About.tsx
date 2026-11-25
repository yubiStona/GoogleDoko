import {
  CircleCheck,
  Home,
  Leaf,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type PublicWebsitePage } from "../api/client";

import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import farmersImage from "../assets/images/why-choose-us/farmers.jpg";
import originsImage from "../assets/images/places/ilam.jpg";
import freshImage from "../assets/images/why-choose-us/fresh.jpg";
import heroImage from "../assets/images/about/hero-farmer.jpg";
import storyImage from "../assets/images/about/story-farmer.jpg";
import promiseImage from "../assets/images/about/promise-banner.jpg";

const missionCards = [
  {
    icon: MapPin,
    title: "Discover by Place",
    description:
      "Explore products based on their original locations and discover what different places in Nepal are known for.",
  },
  {
    icon: Leaf,
    title: "Support Local",
    description:
      "Connect customers with local farmers, producers and merchants.",
  },
  {
    icon: ShieldCheck,
    title: "Build Trust",
    description:
      "Provide clear product, seller and origin information so customers can shop with confidence.",
  },
  {
    icon: ShoppingCart,
    title: "Shop Easily",
    description:
      "Discover, compare and purchase local products through one convenient marketplace.",
  },
];

const whyCards = [
  {
    title: "Authentic Origins",
    description:
      "Every product is connected to its place of origin, helping customers understand where their products come from.",
    image: originsImage,
  },
  {
    title: "Local Producers",
    description:
      "Discover products from local farmers, producers and merchants across different communities.",
    image: farmersImage,
  },
  {
    title: "Fresh & Local",
    description:
      "Find fresh fruits, vegetables and agricultural products sourced from local sellers.",
    image: freshImage,
  },
];

function AboutKicker({ children }: { children: string }) {
  return (
    <div className="about-kicker-row">
      <span className="about-kicker-line" />
      <span className="about-kicker-dot" />
      <span className="about-kicker">{children}</span>
      <span className="about-kicker-dot" />
      <span className="about-kicker-line" />
    </div>
  );
}

function About() {
  const navigate = useNavigate();
  const [cmsPage, setCmsPage] = useState<PublicWebsitePage | null>(null);
  useEffect(() => { void api.getPublishedPage("about").then((page) => {
    if (page.redirect) navigate(`/pages/${page.slug}`, { replace: true });
    else setCmsPage(page);
  }).catch(() => undefined); }, [navigate]);
  return (
    <>
      <TopBar />
      <Navbar />

      <main className="about-page">
        <div className="about-inner">
          <nav className="about-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">
              <Home size={15} strokeWidth={2.2} />
              Home
            </Link>
            <span aria-hidden="true">›</span>
            <span>About Us</span>
          </nav>

          <section className="about-hero">
            <div className="about-hero-text">
              <span className="about-eyebrow">ABOUT GOOGLE DOKO</span>
              <h1>{cmsPage?.title || "Connecting Nepal’s Local Products with the People Who Love Them"}</h1>
              <p>
                {cmsPage?.description || <>GoogleDoko is a location-based marketplace that helps you
                discover fresh, authentic and locally sourced products from
                different places across Nepal.</>}
              </p>
              <div className="about-hero-actions">
                <Link to="/shop" className="about-btn-primary">
                  Explore Products +
                </Link>
                <Link to="/places" className="about-btn-outline">
                  Explore Local Places
                </Link>
              </div>
            </div>

            <div className="about-hero-media">
              <img
                src={heroImage}
                alt="Local farmer with a basket of fresh produce in the hills"
              />
              <div className="about-hero-pills">
                <span>
                  <UserRound size={16} strokeWidth={2.2} />
                  Local Farmers
                </span>
                <span>
                  <Leaf size={16} strokeWidth={2.2} />
                  Fresh Products
                </span>
                <span>
                  <MapPin size={16} strokeWidth={2.2} />
                  Authentic Origins
                </span>
              </div>
            </div>
          </section>

          <section className="about-story">
            <div className="about-story-image">
              <img
                src={storyImage}
                alt="Local farmer holding a basket of vegetables in the mountains"
              />
            </div>
            <div className="about-story-text">
              <span className="about-eyebrow">OUR STORY</span>
              <h2>Discover the story behind every product.</h2>
              {cmsPage?.body ? cmsPage.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <>
              <p>
                Every place has something special to offer. From fresh apples
                grown in the hills to honey, spices, vegetables and traditional
                products made by local communities, Nepal is rich in products
                connected to their place of origin.
              </p>
              <p>
                GoogleDoko was created to make these products easier to
                discover. Instead of simply searching for a product, customers
                can discover where it comes from, learn about its origin and
                find trusted sellers.
              </p>
              </>}
            </div>
          </section>
        </div>

        <section className="about-mission">
          <AboutKicker>OUR MISSION</AboutKicker>
          <h2>Making local products easier to discover, trust and purchase.</h2>
          <div className="about-mission-grid">
            {missionCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.title}>
                  <div className="about-mission-icon">
                    <Icon size={28} strokeWidth={1.8} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="about-why">
          <div className="about-inner">
            <AboutKicker>WHY GOOGLE DOKO?</AboutKicker>
            <h2>More than a marketplace — a way to discover Nepal.</h2>
            <div className="about-why-grid">
              {whyCards.map((card) => (
                <article className="about-why-card" key={card.title}>
                  <div className="about-why-photo">
                    <img src={card.image} alt="" />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-works">
          <div className="about-inner">
            <AboutKicker>HOW GOOGLEDOKO WORKS</AboutKicker>
            <h2>From a place in Nepal to your table.</h2>
            <ol className="about-works-list">
              <li>
                <strong>1. Explore a Place</strong>
                <span>Start with a location and see what it is known for.</span>
              </li>
              <li>
                <strong>2. Discover Products</strong>
                <span>Browse authentic items connected to that origin.</span>
              </li>
              <li>
                <strong>3. Choose a Seller</strong>
                <span>Compare trusted local farmers and merchants.</span>
              </li>
              <li>
                <strong>4. Order &amp; Enjoy</strong>
                <span>Checkout and get fresh products delivered.</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="about-promise">
          <div className="about-inner">
            <div className="about-promise-banner">
              <img
                className="about-promise-photo"
                src={promiseImage}
                alt="Basket of fresh vegetables, peppers, tomatoes and a jar of preserve"
              />
              <div className="about-promise-copy">
                <span className="about-eyebrow">OUR PROMISE</span>
                <h2>Know where your products come from.</h2>
                <p>
                  We want customers to have a clearer connection with the
                  products they buy — from the place they come from to the
                  people who produce and sell them.
                </p>
                <div className="about-promise-list">
                  <span>
                    <CircleCheck size={16} fill="currentColor" stroke="#dff6ee" />
                    Clear Product Information
                  </span>
                  <span>
                    <CircleCheck size={16} fill="currentColor" stroke="#dff6ee" />
                    Seller Information
                  </span>
                  <span>
                    <CircleCheck size={16} fill="currentColor" stroke="#dff6ee" />
                    Origin Information
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default About;
