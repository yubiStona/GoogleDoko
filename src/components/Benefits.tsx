import {
  Star,
  BadgeCheck,
  Truck,
  CheckCheck,
} from "lucide-react";

const benefits = [
  {
    id: 1,
    title: "Top Rank Farms",
    description:
      "farm-fresh produce to bring quality and health to your family's table, every day.",
    icon: Star,
    color: "teal",
  },
  {
    id: 2,
    title: "Organic Certified",
    description:
      "Guaranteed pure, naturally grown products for a healthier, chemical-free lifestyle.",
    icon: BadgeCheck,
    color: "orange",
  },
  {
    id: 3,
    title: "Fast Delivery",
    description:
      "Fresh groceries at your doorstep in no time, ensuring convenience without the wait!",
    icon: Truck,
    color: "teal",
  },
  {
    id: 4,
    title: "Trusted Products",
    description:
      "Handpicked, high-quality items you can rely on for your family's well-being.",
    icon: CheckCheck,
    color: "orange",
  },
];

function Benefits({ content = {} }: { content?: Record<string, string> }) {
  return (
    <section className="benefits-section">
      <div className="benefits-heading">
        <span className="heading-line"></span>

        <p>{content.title || "Explore the land of mountains and vibrant culture"}</p>
        {content.description && <small>{content.description}</small>}

        <span className="heading-line"></span>
      </div>

      <div className="benefits-grid">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div className="benefit-card" key={benefit.id}>
              <div className={`benefit-large-icon ${benefit.color}`}>
                <Icon size={48} strokeWidth={2.5} />
              </div>

              <h3>{content[`item${benefit.id}Title`] || benefit.title}</h3>

              <p>{content[`item${benefit.id}Description`] || benefit.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Benefits;