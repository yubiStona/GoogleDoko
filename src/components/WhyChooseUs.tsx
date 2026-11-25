import organicImage from "../assets/images/why-choose-us/organic.png";
import farmersImage from "../assets/images/why-choose-us/farmers.png";
import freshImage from "../assets/images/why-choose-us/fresh.png";
import qualityImage from "../assets/images/why-choose-us/quality.png";
import deliveryImage from "../assets/images/why-choose-us/delivery.png";

const reasons = [
  {
    id: 1,
    title: "100 % Organic",
    description: "No Harmful Chemicals",
    image: organicImage,
  },
  {
    id: 2,
    title: "Local Farmers",
    description: "Support local livelihood",
    image: farmersImage,
  },
  {
    id: 3,
    title: "Fresh & Natural",
    description: "Fresh to table",
    image: freshImage,
  },
  {
    id: 4,
    title: "Quality Assured",
    description: "Strict quality check",
    image: qualityImage,
  },
  {
    id: 5,
    title: "Safe Delievery",
    description: "Hygienic & timely",
    image: deliveryImage,
  },
];

function WhyChooseUs({ content = {} }: { content?: Record<string, string> }) {
  return (
    <section className="why-choose-us-section">
      <div className="why-choose-us-container">

        {/* Section Heading */}
        <div className="why-choose-us-heading">

          <div className="why-heading-decoration">
            <span className="why-heading-dot"></span>
            <span className="why-heading-line"></span>
          </div>

          <h2>{content.title || "Why Choose Us"}</h2>

          <div className="why-heading-decoration right">
            <span className="why-heading-line"></span>
            <span className="why-heading-dot"></span>
          </div>

        </div>

        {/* Reasons */}
        <div className="why-choose-us-grid">
          {reasons.map((reason) => (
            <article
              className="why-choose-us-item"
              key={reason.id}
            >
              <div className="why-choose-us-image">
                <img
                  src={reason.image}
                  alt={reason.title}
                  className="why-icon-img"
                />
              </div>

              <h3>{content[`item${reason.id}Title`] || reason.title}</h3>

              <p>{content[`item${reason.id}Description`] || reason.description}</p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

export default WhyChooseUs;