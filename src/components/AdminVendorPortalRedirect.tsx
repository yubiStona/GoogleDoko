import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { adminVendorPortalUrl } from "../utils/adminVendorPortal";

export default function AdminVendorPortalRedirect() {
  const location = useLocation();
  const target = adminVendorPortalUrl(
    `${location.pathname}${location.search}${location.hash}`
  );

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main role="status" aria-live="polite" className="auth-gate-page">
      Opening the GoogleDoko admin and vendor portal…
    </main>
  );
}
