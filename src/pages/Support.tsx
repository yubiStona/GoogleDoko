import { useEffect, useState } from "react";
import SupportModal from "../components/SupportModal";
import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { api, type PublicBusinessSettings } from "../api/client";

function Support() {
  const [open, setOpen] = useState(false);
  const [business, setBusiness] = useState<PublicBusinessSettings | null>(null);
  useEffect(() => { void api.getPublicBusinessSettings().then(setBusiness).catch(() => undefined); }, []);
  return (
    <>
      <TopBar />
      <Navbar />

      <main className="shop-page">
        <section className="shop-banner">
          <div className="shop-banner-content">
            <span>CONTACT SUPPORT</span>
            <h1>We are here to help with your orders</h1>
            <p>
              Track your delivery, ask about payments, or get help
              from our support team.
            </p>
            <p><a href={`mailto:${business?.supportEmail || "support@googledoko.com"}`}>{business?.supportEmail || "support@googledoko.com"}</a></p>
            {business?.supportPhone && <p><a href={`tel:${business.supportPhone}`}>{business.supportPhone}</a></p>}
            {business?.businessHours && <p>{business.businessHours}</p>}
            <button className="auth-btn" type="button" onClick={() => setOpen(true)}>Contact Support</button>
            
          </div>
        </section>
      </main>

      <SupportModal open={open} onClose={() => setOpen(false)} />
      <Footer />
    </>
  );
}

export default Support;
