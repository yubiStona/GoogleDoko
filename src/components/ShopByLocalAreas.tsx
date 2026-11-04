import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, ChevronRight } from "lucide-react";

import { useGetPlacesQuery } from "../store/api/apiSlice";
import { useSideScroll } from "../hooks/useSideScroll";

import ilamImg from "../assets/images/places/ilam.jpg";
import mustangImg from "../assets/images/places/mustang.jpg";
import bhaktapurImg from "../assets/images/places/bhaktapur.jpg";
import chitwanImg from "../assets/images/places/chitwan.jpg";
import palpaImg from "../assets/images/places/palpa.jpg";
import kathmanduImg from "../assets/images/places/kathmandu.jpg";
import kavreImg from "../assets/images/places/kavre.jpg";
import dangImg from "../assets/images/places/dang.jpg";

interface LocalAreaItem {
  id: string;
  name: string;
  region: string;
  specialty: string;
  image: string;
  to: string;
}

const FALLBACK_AREAS: LocalAreaItem[] = [
  {
    id: "ilam",
    name: "Ilam",
    region: "Eastern Hills",
    specialty: "Famous for Organic Orthodox Tea & Cardamom",
    image: ilamImg,
    to: "/places/ilam",
  },
  {
    id: "mustang",
    name: "Mustang",
    region: "Himalayan Region",
    specialty: "Crisp Mountain Apples & Himalayan Herbs",
    image: mustangImg,
    to: "/places/mustang",
  },
  {
    id: "bhaktapur",
    name: "Bhaktapur",
    region: "Kathmandu Valley",
    specialty: "Artisanal Pottery, Woodcraft & Juju Dhau",
    image: bhaktapurImg,
    to: "/places/bhaktapur",
  },
  {
    id: "chitwan",
    name: "Chitwan",
    region: "Terai Plains",
    specialty: "Pure Forest Honey, Mustard & Herbs",
    image: chitwanImg,
    to: "/places/chitwan",
  },
  {
    id: "palpa",
    name: "Palpa",
    region: "Western Hills",
    specialty: "Authentic Handwoven Dhaka & Hill Coffee",
    image: palpaImg,
    to: "/places/palpa",
  },
  {
    id: "kathmandu",
    name: "Kathmandu",
    region: "Central Valley",
    specialty: "Himalayan Spices, Teas & Heritage Crafts",
    image: kathmanduImg,
    to: "/places/kathmandu",
  },
  {
    id: "kavre",
    name: "Kavre",
    region: "Central Hills",
    specialty: "Fresh Organic Dairy, Honey & Mountain Veggies",
    image: kavreImg,
    to: "/places/kavre",
  },
  {
    id: "dang",
    name: "Dang",
    region: "Mid-Western Valleys",
    specialty: "Pure Mustard Oil, Grains & Herbal Extracts",
    image: dangImg,
    to: "/places/dang",
  },
];

const placeImages = import.meta.glob("../assets/images/places/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function resolvePlaceImage(origin?: string) {
  if (!origin) return ilamImg;
  const slug = origin.split(",")[0].trim().toLowerCase().replace(/\s+/g, "-");
  return (
    placeImages[`../assets/images/places/${slug}.jpg`] ||
    placeImages["../assets/images/places/ilam.jpg"] ||
    ilamImg
  );
}

export default function ShopByLocalAreas() {
  const { data: serverPlaces } = useGetPlacesQuery();

  const { scrollRef, scrollRight } = useSideScroll();

  const areas: LocalAreaItem[] = useMemo(() => {
    if (serverPlaces && serverPlaces.length > 0) {
      return serverPlaces.slice(0, 8).map((p) => {
        const id =
          p.id || p.origin?.split(",")[0].trim().toLowerCase() || "ilam";
        return {
          id,
          name: p.name || p.origin?.split(",")[0].trim() || "Local Area",
          region: p.origin || "Nepal",
          specialty:
            p.description ||
            `Authentic harvest & artisanal goods (${p.itemCount ?? p.itemCount ?? "multiple"} products)`,
          image: resolvePlaceImage(p.origin),
          to: `/places/${id}`,
        };
      });
    }
    return FALLBACK_AREAS;
  }, [serverPlaces]);

  return (
    <section
      className="shop-by-local-areas-section"
      aria-labelledby="shop-local-areas-heading"
    >
      <div className="section-header">
        <div>
          <h2 id="shop-local-areas-heading">Shop by Local Areas</h2>
          <p className="section-subheading">
            Discover authentic local products sourced directly from their
            original regions
          </p>
        </div>

        <div className="section-header-actions">
          <Link to="/places" className="section-view-all">
            View all
          </Link>
          <button
            type="button"
            onClick={scrollRight}
            className="section-scroll-next-btn"
            aria-label="Next local areas"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        className="local-areas-grid local-areas-side-scroll-track"
        ref={scrollRef}
      >
        {areas.map((area) => (
          <Link
            key={area.id}
            to={area.to}
            className="local-area-card"
            aria-label={`Explore authentic products from ${area.name}`}
          >
            <div className="local-area-img-wrap">
              <img
                src={area.image}
                alt={`${area.name} regional landscape`}
                className="local-area-img"
                onError={(e) => {
                  e.currentTarget.src = ilamImg;
                }}
              />
              <span className="local-area-badge">
                <MapPin size={13} className="local-area-pin-icon" />
                <span>{area.region}</span>
              </span>
            </div>

            <div className="local-area-info">
              <h3 className="local-area-title">{area.name}</h3>
              <p className="local-area-desc">{area.specialty}</p>
              <div className="local-area-action">
                <span>Explore Products</span>
                <ArrowRight
                  size={15}
                  className="local-area-arrow-icon"
                  aria-hidden="true"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
