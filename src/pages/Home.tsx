import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/Hero";
import Benefits from "../components/Benefits";
import SpecialOffers from "../components/SpecialOffers";
import ShopByLocalAreas from "../components/ShopByLocalAreas";
import ShopByLifestyle from "../components/ShopByLifestyle";
import Categories from "../components/Categories";
import PopularProducts from "../components/PopularProducts";
import HowItWorks from "../components/HowItWorks";
import OrganicPromo from "../components/OrganicPromo";
import WhyChooseUs from "../components/WhyChooseUs";
import CustomerReviews from "../components/CustomerReviews";
import Newsletter from "../components/NewsLetter";
import Footer from "../components/layout/Footer";

//react router

function Home() {
  return (
    <>
      <TopBar />

      <Navbar />

      <main>
        <Hero />

        <Benefits />

        <SpecialOffers />

        <ShopByLocalAreas />

        <ShopByLifestyle />

        <Categories />

        <PopularProducts />

        <HowItWorks />

        <OrganicPromo />

        <WhyChooseUs />

        <CustomerReviews />

        <Newsletter />
      </main>

      <Footer />
    </>
  );
}

export default Home;