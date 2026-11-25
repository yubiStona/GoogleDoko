import {
  UserRound,
  Phone,
  CircleHelp,
  MapPin,
  ShieldCheck,
  Lock,
  Undo2,
  Package,
  FileText,
  ShoppingCart,
  ClipboardList,
  Heart,
  Mail,
  Navigation,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import LogoMark from "../LogoMark";
import { adminVendorPortalUrl } from "../../utils/adminVendorPortal";
import { useEffect, useState } from "react";
import { api, type PublicBusinessSettings } from "../../api/client";

function Footer() {
  const [business, setBusiness] = useState<PublicBusinessSettings | null>(null);
  useEffect(() => { void api.getPublicBusinessSettings().then(setBusiness).catch(() => undefined); }, []);
  if (business?.footerVisible === false) return null;
  return (
    <footer className="footer">
      {/* Main Footer */}
      <div className="footer-main">
        <div className="footer-container">
          {/* ========================================
              BRAND
          ======================================== */}

          <div className="footer-column footer-brand">
            <div className="footer-logo">
              <LogoMark className="footer-logo-icon" decorative />

              <span>{business?.footerContent?.aboutTitle || "GoogleDoko"}</span>
            </div>

            <p className="footer-description">
              {business?.footerContent?.aboutText || "Discover fresh, authentic and locally sourced products from different places across Nepal."}
            </p>

            {/* Payment Methods */}
            <div className="payment-methods">
              <span className="payment visa">VISA</span>

              <span className="payment paypal">P</span>

              <span className="payment mastercard">
                <span></span>
                <span></span>
              </span>

              <span className="payment gpay">
                <strong>G</strong> Pay
              </span>
            </div>

            {/* Footer Tagline */}
            <div className="footer-tagline">
              <span className="tagline-line"></span>

              <LogoMark className="tagline-leaf" decorative />

              <span className="tagline-line"></span>

              <p>Fresh. Natural. Delivered with Care.</p>
            </div>
          </div>

          {/* ========================================
              SERVICES
          ======================================== */}

          <div className="footer-column">
            <h3>Services</h3>

            <ul className="footer-links">
              <li>
                <Link to="/about">
                  <UserRound size={21} />
                  <span>About Us</span>
                </Link>
              </li>

              <li>
                <Link to="/support">
                  <Phone size={21} />
                  <span>Contact us</span>
                </Link>
              </li>

              <li>
                <Link to="/pages/news">
                  <CircleHelp size={21} />
                  <span>News</span>
                </Link>
              </li>

              <li>
                <Link to="/places">
                  <MapPin size={21} />
                  <span>Store location</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ========================================
              PRIVACY & TERMS
          ======================================== */}

          <div className="footer-column">
            <h3>Privacy &amp; Terms</h3>

            <ul className="footer-links">
              <li>
                <Link to="/about">
                  <ShieldCheck size={21} />
                  <span>Payment policy</span>
                </Link>
              </li>

              <li>
                <Link to="/pages/privacy">
                  <Lock size={21} />
                  <span>{business?.footerContent?.privacyLabel || "Privacy policy"}</span>
                </Link>
              </li>

              <li>
                <Link to="/about">
                  <Undo2 size={21} />
                  <span>Return policy</span>
                </Link>
              </li>

              <li>
                <Link to="/delivery">
                  <Package size={21} />
                  <span>Shipping policy</span>
                </Link>
              </li>

              <li>
                <Link to="/pages/terms">
                  <FileText size={21} />
                  <span>{business?.footerContent?.termsLabel || "Terms &amp; condition"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ========================================
              MY ACCOUNT
          ======================================== */}

          <div className="footer-column">
            <h3>My Account</h3>

            <ul className="footer-links">
              <li>
                <Link to="/account">
                  <UserRound size={21} />
                  <span>My account</span>
                </Link>
              </li>

              <li>
                <Link to="/cart">
                  <ShoppingCart size={21} />
                  <span>My cart</span>
                </Link>
              </li>

              <li>
                <Link to="/account/orders">
                  <ClipboardList size={21} />
                  <span>Order history</span>
                </Link>
              </li>

              <li>
                <Link to="/account/wishlist">
                  <Heart size={21} />
                  <span>My wishlist</span>
                </Link>
              </li>

              <li>
                <Link to="/account/addresses">
                  <Navigation size={21} />
                  <span>My address</span>
                </Link>
              </li>

              <li>
                <a href={adminVendorPortalUrl("/vendor")}>
                  <Store size={21} />
                  <span>Vendor Portal</span>
                </a>
              </li>
            </ul>
          </div>

          {/* ========================================
              LOCATION
          ======================================== */}

          <div className="footer-column footer-location">
            <h3>Location</h3>

            <div className="contact-item">
              <MapPin size={25} className="contact-icon orange" />

              <p>{business?.footerContent?.location || business?.supportAddress || "Kathmandu, Nepal"}</p>
            </div>

            <div className="contact-item">
              <Phone size={23} className="contact-icon orange" />

              <p>{business?.footerContent?.phone || business?.supportPhone || "+977 111-111-1111"}</p>
            </div>

            <div className="contact-item">
              <Mail size={23} className="contact-icon orange" />

              <p>{business?.footerContent?.email || business?.supportEmail || "support@googledoko.com"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          COPYRIGHT
      ======================================== */}

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© 2026&nbsp; GoogleDoko, All Rights Reserved.</p>

          <div className="footer-bottom-links">
            <Link to="/pages/terms">{business?.footerContent?.termsLabel || "Terms and conditions"}</Link>

            <Link to="/pages/privacy">{business?.footerContent?.privacyLabel || "Privacy policy"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
