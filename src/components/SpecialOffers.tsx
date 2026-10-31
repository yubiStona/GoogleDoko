import OfferCard from "./OfferCard";
import { Link } from "react-router-dom";
import { useGetOffersQuery } from "../store/api/apiSlice";

import explorePlacesImage from "../assets/images/offers/explore-places-hd.png";
import popularNearYouImage from "../assets/images/offers/popular-near-you-hd.png";
import seasonalImage from "../assets/images/offers/seasonal-hd.png";

interface OfferItem {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  image: string;
  theme: "green" | "yellow" | "blue";
  to: string;
}

const fallbackOffers: OfferItem[] = [
  {
    id: 1,
    title: "Explore by Places",
    description: "Fresh picks from local farmers near you",
    buttonText: "Explore Now",
    image: explorePlacesImage,
    theme: "green",
    to: "/places",
  },
  {
    id: 2,
    title: "Popular Near You",
    description: "Top loved picks in your area",
    buttonText: "Explore Now",
    image: popularNearYouImage,
    theme: "yellow",
    to: "/shop",
  },
  {
    id: 3,
    title: "Seasonal Products",
    description: "Handpicked freshness for every season",
    buttonText: "Discover Now",
    image: seasonalImage,
    theme: "blue",
    to: "/shop",
  },
];

function SpecialOffers() {
  const { data: serverOffers } = useGetOffersQuery();

  const offers: OfferItem[] = (serverOffers?.banners && serverOffers.banners.length > 0)
    ? serverOffers.banners.map((b: any) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        buttonText: b.buttonText || "Explore Now",
        image:
          b.id === 1
            ? explorePlacesImage
            : b.id === 2
            ? popularNearYouImage
            : b.id === 3
            ? seasonalImage
            : b.image || explorePlacesImage,
        theme: (b.theme || "green") as "green" | "yellow" | "blue",
        to: b.to || "/shop",
      }))
    : fallbackOffers;

  return (
    <section className="offers-section">
      <div className="section-header">
        <h2>Special Offers</h2>
        <Link to="/shop" className="section-view-all">
          View all
        </Link>
      </div>

      <div className="offers-grid">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            title={offer.title}
            description={offer.description}
            buttonText={offer.buttonText}
            image={offer.image}
            theme={offer.theme}
            to={offer.to}
          />
        ))}
      </div>
    </section>
  );
}

export default SpecialOffers;
