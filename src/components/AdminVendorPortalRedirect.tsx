import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { adminVendorPortalUrl } from "../utils/adminVendorPortal";
import { getToken } from "../api/client";

export default function AdminVendorPortalRedirect() {
  const location = useLocation();
  const token = getToken();

  const rawTarget = adminVendorPortalUrl(
    `${location.pathname}${location.search}${location.hash}`
  );
  let target = rawTarget;
  if (token) {
    try {
      const url = new URL(rawTarget);
      url.searchParams.set("auth_token", token);
      target = url.toString();
    } catch {
      const separator = rawTarget.includes("?") ? "&" : "?";
      target = `${rawTarget}${separator}auth_token=${encodeURIComponent(token)}`;
    }
  }

  useEffect(() => {
    if (window.location.port === "5174" || window.location.href === target) {
      return;
    }
    window.location.replace(target);
  }, [target]);

  return (
    <main role="status" aria-live="polite" className="auth-gate-page">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center", padding: "32px 16px" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#374151", fontSize: "15px", fontWeight: 500 }}>
          Opening the GoogleDoko admin and vendor portal…
        </p>
        <a
          href={target}
          style={{ color: "#16a34a", textDecoration: "underline", fontSize: "14px", marginTop: "4px" }}
        >
          Click here if you are not redirected automatically
        </a>
      </div>
    </main>
  );
}
