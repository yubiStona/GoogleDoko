import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import TopBar from "./TopBar";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import { useAccount } from "../context/AccountContext";
import { authPromptCopy, type AuthIntent } from "../context/AuthFlowContext";

function AuthGate({ intent }: { intent: AuthIntent }) {
  const location = useLocation();
  const copy = authPromptCopy(intent);
  const from = `${location.pathname}${location.search}`;

  return (
    <>
      <TopBar />
      <Navbar />
      <main className="auth-gate-page">
        <div className="auth-prompt-card static">
          <h1>{copy.title}</h1>
          <p>{copy.message}</p>
          <div className="auth-prompt-actions">
            <Link to="/login" state={{ from }} className="auth-btn">
              Login
            </Link>
            <Link to="/signup" state={{ from }} className="auth-btn ghost">
              Create Account
            </Link>
            <Link to="/" className="auth-prompt-continue">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ProtectedRoute({
  children,
  intent = "account",
}: {
  children: ReactNode;
  intent?: AuthIntent;
}) {
  const { isLoggedIn, loadingSession } = useAccount();

  if (loadingSession) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthGate intent={intent} />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
