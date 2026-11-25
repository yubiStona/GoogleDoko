import { ArrowRight } from "lucide-react";
import farmerImage from "../assets/images/how-it-works/farmer.png";
import verificationImage from "../assets/images/how-it-works/verification.png";
import packagingImage from "../assets/images/how-it-works/packaging.png";
import deliveryImage from "../assets/images/how-it-works/delivery.png";

const steps = [
  {
    id: 1,
    title: "Farmer",
    description: (
      <>
        Local farmers
        <br />
        bring fresh, organic
        <br />
        produce
      </>
    ),
    image: farmerImage,
  },
  {
    id: 2,
    title: "Verification",
    description: (
      <>
        Quality checked
        <br />
        for freshness
        <br />
        and safety
      </>
    ),
    image: verificationImage,
  },
  {
    id: 3,
    title: "Packaging",
    description: (
      <>
        Carefully packed
        <br />
        to keep produce
        <br />
        fresh
      </>
    ),
    image: packagingImage,
  },
  {
    id: 4,
    title: "Delivery",
    description: (
      <>
        Delivered fresh
        <br />
        to your home
      </>
    ),
    image: deliveryImage,
  },
];

function HowItWorks({ content = {} }: { content?: Record<string, string> }) {
  return (
    <section className="how-it-works-section">
      <div className="how-it-works-container">

        {/* Heading */}
        <div className="how-it-works-heading">
          <div className="heading-decoration">
            <span className="heading-dot"></span>
            <span className="heading-line"></span>
          </div>

          <h2>{content.title || "How It Works"}</h2>

          <div className="heading-decoration right">
            <span className="heading-line"></span>
            <span className="heading-dot"></span>
          </div>
        </div>

        <p className="how-it-works-subtitle">
          {content.description || "From fresh farms to your doorstep in 4 simple steps"}
        </p>

        {/* Steps */}
        <div className="steps-container">
          {steps.map((step, index) => (
            <div className="step-item-group" key={step.id}>
              <div className="step">
                {/* Image */}
                <div className="step-image-wrapper">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="step-icon-img"
                  />
                </div>

                {/* Text */}
                <h3>{content[`step${index + 1}Title`] || step.title}</h3>

                <p>{content[`step${index + 1}Description`] || step.description}</p>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="step-arrow" aria-hidden="true">
                  <ArrowRight size={22} strokeWidth={2.4} />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;