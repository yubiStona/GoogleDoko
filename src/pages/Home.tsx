import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/Hero";
import Benefits from "../components/Benefits";
import SpecialOffers from "../components/SpecialOffers";
import ShopByLocalAreas from "../components/ShopByLocalAreas";
import Categories from "../components/Categories";
import PopularProducts from "../components/PopularProducts";
import HowItWorks from "../components/HowItWorks";
import OrganicPromo from "../components/OrganicPromo";
import WhyChooseUs from "../components/WhyChooseUs";
import CustomerReviews from "../components/CustomerReviews";
import Newsletter from "../components/NewsLetter";
import Footer from "../components/layout/Footer";
import { api, type PublicLandingContent } from "../api/client";

function Home() {
  const [cms, setCms] = useState<PublicLandingContent | null>(null);
  useEffect(() => {
    let active = true;
    const load = () => api.getPublicLandingContent().then((content) => { if (active) setCms(content); }).catch(() => undefined);
    void load();
    const timer = window.setInterval(load, 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const sections = cms?.sections || {};
  const visible = (key: string) => cms?.visibility?.[`food_home_${key}`] !== 0;

  return (
    <>
      <TopBar />
      <Navbar />
      <main>
        {visible("hero") && <Hero content={sections.food_home_hero} />}
        {visible("explore") && <Benefits content={sections.food_home_explore} />}
        {visible("special_offers") && <SpecialOffers content={sections.food_home_special_offers} />}
        {visible("places") && <ShopByLocalAreas content={sections.food_home_places} />}
        {visible("categories") && <Categories content={sections.food_home_categories} />}
        {visible("popular_products") && <PopularProducts />}
        {visible("how_it_works") && <HowItWorks content={sections.food_home_how_it_works} />}
        {visible("promo") && <OrganicPromo content={sections.food_home_promo} />}
        {visible("why_choose_us") && <WhyChooseUs content={sections.food_home_why_choose_us} />}
        {visible("reviews") && <CustomerReviews />}
        {visible("newsletter") && <Newsletter />}
      </main>
      <Footer />
    </>
  );
}

export default Home;
