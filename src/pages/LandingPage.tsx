import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Compass,
  Heart,
  HeartHandshake,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGetLandingPageContentQuery } from "../store/api/hero";

import heroStoryImage from "../assets/images/about/our-story-hero.jpg";
import foodCardScene from "../assets/images/landing/landing-card-food.jpg";
import lifestyleCardScene from "../assets/images/landing/landing-card-lifestyle.jpg";

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

const dokoPillars = [
  {
    icon: Compass,
    iconColor: "green",
    title: "The Symbol of the Doko",
    description:
      "In the hills and terraced landscapes of Nepal, the doko is more than woven bamboo. Carried with a namlo headband, it bears the weight of honest labor, carrying morning harvests, mountain firewood, and handmade goods from remote trails to village centers.",
  },
  {
    icon: Sparkles,
    iconColor: "orange",
    title: "Preserving Origin & Heritage",
    description:
      "From crisp high-altitude apples of Mustang and fragrant tea leaves of Ilam to cold-pressed mustard oil of Chitwan, every corner of Nepal holds a specialty. We ensure every product is celebrated with its authentic place of origin.",
  },
  {
    icon: HeartHandshake,
    iconColor: "blue",
    title: "Direct Farmer & Maker Value",
    description:
      "Traditional supply chains take up to 60% of value away from the producer. GoogleDoko bridges consumers directly to grassroots farmers and indigenous artisans, guaranteeing dignified earnings and sustainable livelihoods.",
  },
];

const timelineMilestones = [
  {
    step: "01",
    year: "The Inspiration",
    title: "Bridging the Urban-Rural Divide",
    description:
      "We saw urban homes yearning for fresh, chemical-free food and authentic Nepali craftsmanship, while farmers and weavers in rural districts faced transport bottlenecks and middlemen. We set out to build a digital highway connecting them.",
  },
  {
    step: "02",
    year: "Grassroots Sourcing",
    title: "Empowering Local Producers",
    description:
      "By establishing direct relationships with farmer cooperatives in Mustang, Jumla, Ilam, and Palpa, we ensured fair farm-gate pricing, zero exploitative intermediaries, and strict organic cultivation practices.",
  },
  {
    step: "03",
    year: "Two Worlds, One Platform",
    title: "Uniting Food & Living",
    description:
      "We expanded the doko to carry not just nourishment for the table, but warmth for the home—introducing handcrafted Dhaka textiles, Bhaktapur pottery, and indigenous decor alongside farm produce.",
  },
  {
    step: "04",
    year: "The Future",
    title: "A Conscious Nepali Economy",
    description:
      "Today, GoogleDoko is proud to serve as Nepal's premier destination for origin-certified regional treasures. Every purchase directly empowers rural households, keeping indigenous heritage alive and thriving.",
  },
];

const storyValues = [
  {
    icon: Leaf,
    title: "Authentic Traceability",
    description: "Every item tells you which district, cooperative, or artisan family crafted it.",
  },
  {
    icon: Award,
    title: "Fair Producer Pay",
    description: "Makers receive higher-than-market rates directly, ensuring dignified livelihoods.",
  },
  {
    icon: Heart,
    title: "Cultural Preservation",
    description: "We protect indigenous weaving, pottery, and traditional culinary arts from dying out.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assured",
    description: "Transparent pricing, guaranteed quality checks, and prompt doorstep delivery you can rely on.",
  },
];

export type LandingTab = "explore" | "our-story" | "contact";

interface LandingPageProps {
  initialTab?: LandingTab;
}

export default function LandingPage({ initialTab }: LandingPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useGetLandingPageContentQuery();

  const getInitialTab = (): LandingTab => {
    if (initialTab) return initialTab;
    if (location.pathname === "/our-story" || location.hash === "#our-story") return "our-story";
    if (location.pathname === "/support" || location.hash === "#contact") return "contact";
    return "explore";
  };

  const [activeTab, setActiveTab] = useState<LandingTab>(getInitialTab);

  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (location.pathname === "/our-story" || location.hash === "#our-story") {
      setActiveTab("our-story");
    } else if (location.pathname === "/support" || location.hash === "#contact") {
      setActiveTab("contact");
    } else {
      setActiveTab("explore");
    }
  }, [initialTab, location.pathname, location.hash]);

  const handleTabChange = (tab: LandingTab) => {
    setActiveTab(tab);
    if (tab === "our-story") {
      navigate("/our-story", { replace: false });
    } else if (tab === "contact") {
      navigate("/support", { replace: false });
    } else {
      navigate("/", { replace: false });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSubmitted(true);
  };

  const defaultLandingContent = {
    eyebrow: "Good food. Better choices. Local love.",
    title: "Welcome to GoogleDoko",
    description: "Discover local food and lifestyle products, all in one place.",
    backgroundImage: "/landing-assets/landing-background.jpg",
    food: {
      eyebrow: "Fresh from Nepal",
      title: "Food with a place of origin.",
      description: "Shop farm fresh produce and traditional favourites from local growers.",
      button: "Explore food",
      image: "/landing-assets/food-card-scene.jpg",
      imageAlt: "Traditional Nepali food with a Himalayan hillside and temple",
      href: "/food",
    },
    lifestyle: {
      eyebrow: "Made to be lived with",
      title: "Bring local craft into your home.",
      description: "Find thoughtful home, fashion, and handmade goods from Nepalese makers.",
      button: "Explore lifestyle",
      image: "/landing-assets/lifestyle-card-scene.jpg",
      imageAlt: "Nepali handcrafted bag and home goods beside a mountain view",
      href: "/lifestyle-coming-soon",
    },
  };

  const page =
    data && !Array.isArray(data) && typeof data === "object" && "title" in data && data.title
      ? {
          ...defaultLandingContent,
          ...data,
          food: { ...defaultLandingContent.food, ...(data.food || {}) },
          lifestyle: { ...defaultLandingContent.lifestyle, ...(data.lifestyle || {}) },
        }
      : defaultLandingContent;

  return (
    <main
      className="landing-page"
      style={{ "--landing-backdrop": `url("${page.backgroundImage}")` } as CSSProperties & { "--landing-backdrop": string }}
    >
      <header className="landing-header">
        <LandingBrand />
        <nav className="landing-nav" aria-label="Main navigation">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleTabChange("explore");
            }}
            className={`landing-nav-link ${activeTab === "explore" ? "active" : ""}`}
            aria-current={activeTab === "explore" ? "page" : undefined}
          >
            Explore
          </Link>
          <Link
            to="/our-story"
            onClick={(e) => {
              e.preventDefault();
              handleTabChange("our-story");
            }}
            className={`landing-nav-link ${activeTab === "our-story" ? "active" : ""}`}
            aria-current={activeTab === "our-story" ? "page" : undefined}
          >
            Our story
          </Link>
          <Link
            to="/support"
            onClick={(e) => {
              e.preventDefault();
              handleTabChange("contact");
            }}
            className={`landing-nav-link ${activeTab === "contact" ? "active" : ""}`}
            aria-current={activeTab === "contact" ? "page" : undefined}
          >
            Contact
          </Link>
        </nav>
        <div className="landing-header-actions">
          <Link to="/login" className="landing-login">Sign in</Link>
        </div>
      </header>

      {/* TAB 1: EXPLORE VIEW */}
      {activeTab === "explore" ? (
        <>
          <section className="landing-intro" aria-labelledby="landing-title">
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
        </>
      ) : activeTab === "our-story" ? (
        /* TAB 2: OUR STORY VIEW (Matched to landing page theme and bg) */
        <div className="landing-story-section" id="our-story">
          {/* Story Hero */}
          <section className="landing-story-hero" aria-labelledby="our-story-heading">
            <div className="landing-story-hero-content">
              <div className="landing-story-badge">
                <Sparkles size={14} />
                Our Story &amp; Heritage
              </div>
              <h1 id="our-story-heading">
                Rooted in Nepal’s Soil, <span>Crafted for Every Home.</span>
              </h1>
              <p className="landing-story-lead">
                The doko is Nepal’s timeless symbol of honest harvest, mountain pathways, and communities
                coming together. GoogleDoko was founded to bring that heartbeat into modern everyday living—connecting
                authentic local food and timeless craftsmanship directly to you.
              </p>

              <div className="landing-story-stats-grid">
                <div className="landing-story-stat-item">
                  <span className="landing-story-stat-num">50+</span>
                  <span className="landing-story-stat-label">Districts &amp; Regions</span>
                </div>
                <div className="landing-story-stat-item">
                  <span className="landing-story-stat-num">300+</span>
                  <span className="landing-story-stat-label">Farmers &amp; Artisans</span>
                </div>
                <div className="landing-story-stat-item">
                  <span className="landing-story-stat-num">100%</span>
                  <span className="landing-story-stat-label">Traceable Origin</span>
                </div>
                <div className="landing-story-stat-item">
                  <span className="landing-story-stat-num">2 Worlds</span>
                  <span className="landing-story-stat-label">Food &amp; Craft</span>
                </div>
              </div>
            </div>

            <div className="landing-story-hero-media">
              <div className="landing-story-hero-image-wrap">
                <img
                  src={heroStoryImage}
                  alt="Traditional Nepali bamboo doko with mountain harvest overlooking Himalayan peaks"
                />
              </div>

              <div className="landing-story-floating-card top-left">
                <div className="floating-icon">
                  <Leaf size={18} strokeWidth={2.2} />
                </div>
                <div className="floating-text">
                  <strong>Farm Fresh Sourcing</strong>
                  <span>Directly from mountain soil</span>
                </div>
              </div>

              <div className="landing-story-floating-card bottom-right">
                <div className="floating-icon warm">
                  <Heart size={18} strokeWidth={2.2} />
                </div>
                <div className="floating-text">
                  <strong>Handcrafted with Care</strong>
                  <span>Living traditions of Nepal</span>
                </div>
              </div>
            </div>
          </section>

          {/* Cultural Pillars */}
          <section className="landing-story-why" aria-labelledby="why-doko-heading">
            <header className="landing-story-section-header">
              <div className="landing-story-badge">
                <Leaf size={14} />
                Living Traditions
              </div>
              <h2 id="why-doko-heading">Why GoogleDoko? The Spirit of the Doko</h2>
              <p>
                A doko is never just an object. For generations of Nepali families, it has carried hopes,
                seasonal harvests, and the crafts of daily survival. We took this sacred spirit and gave it
                a modern home.
              </p>
            </header>

            <div className="landing-story-doko-grid">
              {dokoPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <article className="landing-story-doko-card" key={pillar.title}>
                    <div className={`landing-story-doko-card-icon ${pillar.iconColor}`}>
                      <Icon size={24} strokeWidth={2} />
                    </div>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* One Doko, Two Worlds */}
          <section className="landing-story-worlds-section" aria-labelledby="two-worlds-heading">
            <header className="landing-story-section-header">
              <div className="landing-story-badge">
                <ShoppingBag size={14} />
                One Doko, Two Worlds
              </div>
              <h2 id="two-worlds-heading">The Dual Heart of Our Marketplace</h2>
              <p>
                From your morning breakfast to the cushions on your sofa, GoogleDoko celebrates the best
                creations that Nepal’s geography and rich artisanal heritage have to offer.
              </p>
            </header>

            <div className="landing-story-worlds-grid">
              {/* World 1: Good Food */}
              <article className="landing-story-world-card">
                <div className="landing-story-world-media">
                  <img
                    src={foodCardScene}
                    alt="Authentic Nepali food, dal bhat, and organic fresh produce"
                  />
                  <span className="landing-story-world-tag">Fresh From Nepal</span>
                </div>
                <div className="landing-story-world-body">
                  <h3>Food with a Place of Origin</h3>
                  <p>
                    Every grain, spice, and fruit has a soil it calls home. We connect you with local growers
                    who take pride in their land—delivering authentic regional flavors right to your kitchen table.
                  </p>
                  <ul className="landing-story-world-points">
                    <li><CheckCircle2 size={16} /> Mustang Apples &amp; Marpha Delicacies</li>
                    <li><CheckCircle2 size={16} /> Jumla Marsi Red Rice &amp; Mountain Grains</li>
                    <li><CheckCircle2 size={16} /> Pure Raw Honey from Chitwan Forests</li>
                    <li><CheckCircle2 size={16} /> Hand-ground Organic Spices from Dang</li>
                  </ul>
                  <Link to="/food" className="landing-story-world-btn green">
                    Explore Food <ArrowRight size={16} />
                  </Link>
                </div>
              </article>

              {/* World 2: Local Living */}
              <article className="landing-story-world-card">
                <div className="landing-story-world-media">
                  <img
                    src={lifestyleCardScene}
                    alt="Handcrafted home decor, woven lifestyle goods, and pottery"
                  />
                  <span className="landing-story-world-tag warm">Made to Be Lived With</span>
                </div>
                <div className="landing-story-world-body">
                  <h3>Bring Local Craft into Your Home</h3>
                  <p>
                    True luxury is soulful, tactile, and rooted in human hands. Our lifestyle collection
                    features thoughtful home decor, hand-woven textiles, and artisanal goods made to last.
                  </p>
                  <ul className="landing-story-world-points">
                    <li><CheckCircle2 size={16} /> Hand-spun Himalayan Wool &amp; Yak Blankets</li>
                    <li><CheckCircle2 size={16} /> Hand-poured Beeswax &amp; Himalayan Herb Candles</li>
                    <li><CheckCircle2 size={16} /> Terracotta &amp; Clay Pottery from Bhaktapur</li>
                    <li><CheckCircle2 size={16} /> Authentic Dhaka Patterns, Bags &amp; Table Linen</li>
                  </ul>
                  <Link to="/lifestyle-coming-soon" className="landing-story-world-btn orange">
                    Explore Lifestyle <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            </div>
          </section>

          {/* Journey Milestones */}
          <section className="landing-story-why" aria-labelledby="milestones-heading">
            <header className="landing-story-section-header">
              <div className="landing-story-badge">
                <Compass size={14} />
                Our Journey
              </div>
              <h2 id="milestones-heading">From Mountain Trails to Modern Homes</h2>
              <p>How a small grassroots mission became a nationwide bridge for Nepal’s local producers.</p>
            </header>

            <div className="landing-story-timeline-grid">
              {timelineMilestones.map((m) => (
                <article className="landing-story-timeline-item" key={m.step}>
                  <div className="landing-story-timeline-badge">STEP {m.step} · {m.year}</div>
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Core Values */}
          <section className="landing-story-why" aria-labelledby="values-heading">
            <header className="landing-story-section-header">
              <div className="landing-story-badge">
                <ShieldCheck size={14} />
                Our Commitments
              </div>
              <h2 id="values-heading">What We Stand For</h2>
              <p>Our guiding compass in how we treat the land, the producers, and every household we serve.</p>
            </header>

            <div className="landing-story-values-grid">
              {storyValues.map((val) => {
                const Icon = val.icon;
                return (
                  <article className="landing-story-val-card" key={val.title}>
                    <div className="val-icon"><Icon size={22} strokeWidth={2} /></div>
                    <h3>{val.title}</h3>
                    <p>{val.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Story CTA Banner */}
          <section className="landing-story-cta-section">
            <div className="landing-story-cta-banner">
              <h2>Fill Your Doko with Nepal’s Best</h2>
              <p>
                Join thousands of families supporting local agriculture and celebrating indigenous craft.
                Experience food and lifestyle made with honesty, authenticity, and love.
              </p>
              <div className="landing-story-cta-actions">
                <Link to="/food" className="landing-story-cta-btn primary">
                  Start Shopping Food <ArrowRight size={16} />
                </Link>
                <Link to="/places" className="landing-story-cta-btn secondary">
                  Discover by Places <MapPin size={16} />
                </Link>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* TAB 3: CONTACT VIEW (Matched to landing page theme and bg) */
        <div className="landing-contact-section" id="contact">
          <section className="landing-contact-hero" aria-labelledby="contact-heading">
            <div className="landing-contact-badge">
              <Sparkles size={14} />
              Get in Touch
            </div>
            <h1 id="contact-heading">
              We’re Here to Help, <span>Every Step.</span>
            </h1>
            <p>
              Have a question about regional products, need assistance with an order, or want to partner with us
              as a local farmer or artisan? Our team is always ready to assist.
            </p>
          </section>

          {/* Quick Channels Grid */}
          <div className="landing-contact-grid">
            <article className="landing-contact-card">
              <div className="landing-contact-card-icon">
                <Phone size={22} />
              </div>
              <h3>Customer Hotline</h3>
              <a href="tel:+97714567890" className="card-main-val">+977-1-4567890</a>
              <p>Mon - Sat: 8:00 AM – 8:00 PM</p>
            </article>

            <article className="landing-contact-card">
              <div className="landing-contact-card-icon warm">
                <Mail size={22} />
              </div>
              <h3>Direct Email</h3>
              <a href="mailto:support@googledoko.com" className="card-main-val">support@googledoko.com</a>
              <p>Replies within 2 business hours</p>
            </article>

            <article className="landing-contact-card">
              <div className="landing-contact-card-icon blue">
                <MapPin size={22} />
              </div>
              <h3>Central Hub</h3>
              <span className="card-main-val">Kathmandu, Nepal</span>
              <p>Thamel &amp; Lazimpat Sorting Centers</p>
            </article>

            <article className="landing-contact-card">
              <div className="landing-contact-card-icon purple">
                <HeartHandshake size={22} />
              </div>
              <h3>Grower Partnership</h3>
              <a href="mailto:partners@googledoko.com" className="card-main-val">partners@googledoko.com</a>
              <p>Join 300+ grassroots cooperatives</p>
            </article>
          </div>

          {/* Interactive Form & FAQ Grid */}
          <div className="landing-contact-body-grid">
            <div className="landing-contact-form-card">
              <h2>Send Us a Message</h2>
              <p>Fill out the form below and our team will get in touch promptly.</p>

              {contactSubmitted ? (
                <div className="landing-contact-success" role="status">
                  <CheckCircle2 size={20} />
                  <span>Thank you, {contactForm.name}! Your message has been received. We will respond shortly.</span>
                </div>
              ) : (
                <form className="landing-contact-form" onSubmit={handleContactSubmit}>
                  <div className="landing-contact-input-row">
                    <div className="landing-contact-field">
                      <label htmlFor="contact-name">Full Name *</label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="e.g. Aarav Sharma"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>
                    <div className="landing-contact-field">
                      <label htmlFor="contact-phone">Phone Number</label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="e.g. 9801234567"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="landing-contact-field">
                    <label htmlFor="contact-email">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="e.g. aarav@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>

                  <div className="landing-contact-field">
                    <label htmlFor="contact-message">How can we help? *</label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      placeholder="Tell us about your inquiry, order question, or partnership idea..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="landing-contact-submit-btn">
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>

            <div className="landing-contact-faq-card">
              <h2>Frequently Asked Questions</h2>
              <div className="landing-contact-faq-list">
                <article className="landing-contact-faq-item">
                  <h3>How fast is produce delivered?</h3>
                  <p>Orders within Kathmandu Valley are delivered same-day or within 24 hours. Regional specialty batches ship directly upon harvest.</p>
                </article>
                <article className="landing-contact-faq-item">
                  <h3>Are products verified authentic?</h3>
                  <p>Yes. Every batch is traced to its registered cooperative and district of origin, ensuring genuine origin and ethical compensation.</p>
                </article>
                <article className="landing-contact-faq-item">
                  <h3>What payment methods are supported?</h3>
                  <p>We accept eSewa, Khalti, local Debit/Credit Cards, and Cash on Delivery at your doorstep.</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Promise Strip */}
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
