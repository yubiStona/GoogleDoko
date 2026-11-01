import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldAlert, ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle } from "lucide-react";
import * as yup from "yup";
import { useAccount } from "../../context/AccountContext";

/**
 * Yup validation schema for administrative login credentials
 */
const adminLoginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required("Admin email address is required")
    .email("Enter a valid email address"),
  password: yup
    .string()
    .required("Admin password is required")
    .min(6, "Password must be at least 6 characters"),
});

/**
 * Yup validation schema for new administrator registration
 */
const adminRegisterSchema = yup.object().shape({
  fullName: yup.string().trim().required("Staff full name is required"),
  email: yup
    .string()
    .trim()
    .required("Staff email address is required")
    .email("Enter a valid email address"),
  securityKey: yup.string().trim().required("Master admin security key is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirm: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export function AdminLogin() {
  const navigate = useNavigate();
  const { isLoggedIn, user, login, registerAdmin, logout } = useAccount();

  const [tab, setTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regSecurityKey, setRegSecurityKey] = useState("");
  const [regErrors, setRegErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirm?: string;
    securityKey?: string;
  }>({});

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState("");

  // If already logged in as admin, redirect to dashboard
  if (isLoggedIn && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setSuccessNotice("");

    try {
      await adminLoginSchema.validate(
        { email: loginEmail, password: loginPassword },
        { abortEarly: false }
      );
      setLoginErrors({});
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        const errors: { email?: string; password?: string } = {};
        err.inner.forEach((item) => {
          if (item.path && !errors[item.path as keyof typeof errors]) {
            errors[item.path as keyof typeof errors] = item.message;
          }
        });
        setLoginErrors(errors);
        return;
      }
    }

    setLoading(true);
    const err = await login(loginEmail.trim(), loginPassword, true, "admin");
    setLoading(false);

    if (err) {
      setServerError(err);
    } else {
      navigate("/admin", { replace: true });
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setSuccessNotice("");

    try {
      await adminRegisterSchema.validate(
        {
          fullName: regFullName,
          email: regEmail,
          securityKey: regSecurityKey,
          password: regPassword,
          confirm: regConfirm,
        },
        { abortEarly: false }
      );
      setRegErrors({});
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((item) => {
          if (item.path && !errors[item.path]) {
            errors[item.path] = item.message;
          }
        });
        setRegErrors(errors);
        return;
      }
    }

    setLoading(true);
    const err = await registerAdmin({
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      securityKey: regSecurityKey.trim(),
    });
    setLoading(false);

    if (err) {
      setServerError(err);
    } else {
      setSuccessNotice("Admin account provisioned successfully! Redirecting...");
      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 1000);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #091e14 0%, #0d3822 50%, #041a10 100%)",
        padding: "24px 16px",
        fontFamily: "inherit",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#ffffff",
          color: "#1e293b",
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
            padding: "36px 32px 28px",
            color: "#ffffff",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
            }}
          >
            <ShieldCheck size={32} color="#ffffff" strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            GoogleDoko Admin Portal
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#a7f3d0", fontWeight: 500 }}>
            Restricted Staff &amp; Administrative Console
          </p>
        </div>

        {/* Logged in as different role alert */}
        {isLoggedIn && user.role !== "admin" && (
          <div
            style={{
              background: "#fef3c7",
              borderBottom: "1px solid #fde68a",
              padding: "12px 20px",
              fontSize: 13,
              color: "#92400e",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              Signed in as <strong>{user.email}</strong> ({user.role}). Admin access required.
            </span>
            <button
              type="button"
              onClick={logout}
              style={{
                background: "none",
                border: "none",
                color: "#b45309",
                fontWeight: 700,
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Sign Out
            </button>
          </div>
        )}

        <div style={{ padding: "28px 32px" }}>
          {/* Sub Navigation / Mode Toggle */}
          <div
            style={{
              display: "flex",
              background: "#f1f5f9",
              padding: 4,
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setServerError("");
              }}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
                background: tab === "login" ? "#ffffff" : "transparent",
                color: tab === "login" ? "#065f46" : "#64748b",
                boxShadow: tab === "login" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              Staff Login
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setServerError("");
              }}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
                background: tab === "register" ? "#ffffff" : "transparent",
                color: tab === "register" ? "#065f46" : "#64748b",
                boxShadow: tab === "register" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              Admin Onboarding
            </button>
          </div>

          {/* Notifications */}
          {serverError && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#991b1b",
                fontSize: 13,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ShieldAlert size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {successNotice && (
            <div
              style={{
                background: "#dcfce7",
                border: "1px solid #bbf7d0",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#166534",
                fontSize: 13,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle size={18} />
              <span>{successNotice}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLoginSubmit} noValidate>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#475569",
                    marginBottom: 6,
                  }}
                >
                  Admin Email
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginErrors.email) setLoginErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="admin@example.com"
                    autoComplete="username"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: loginErrors.email ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                  />
                </div>
                {loginErrors.email && (
                  <span style={{ color: "#ef4444", fontSize: 11, marginTop: 4, display: "block", fontWeight: 600 }}>
                    {loginErrors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#475569",
                    marginBottom: 6,
                  }}
                >
                  Admin Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      padding: "12px 42px 12px 14px",
                      borderRadius: 10,
                      border: loginErrors.password ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <span style={{ color: "#ef4444", fontSize: 11, marginTop: 4, display: "block", fontWeight: 600 }}>
                    {loginErrors.password}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #047857 0%, #065f46 100%)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(4, 120, 87, 0.3)",
                  transition: "opacity 0.2s",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Authenticating..." : "Sign In to Admin Console"}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === "register" && (
            <form onSubmit={handleRegisterSubmit} noValidate>
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#1e40af",
                  marginBottom: 16,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <KeyRound size={16} />
                <span>Requires Master Security Key: <code>GOOGLE_DOKO_ADMIN_2026</code></span>
              </div>

              {/* Security Key */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Security Key *
                </label>
                <input
                  type="password"
                  value={regSecurityKey}
                  onChange={(e) => {
                    setRegSecurityKey(e.target.value);
                    if (regErrors.securityKey) setRegErrors((p) => ({ ...p, securityKey: undefined }));
                  }}
                  placeholder="Enter admin authorization key"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: regErrors.securityKey ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
                {regErrors.securityKey && (
                  <span style={{ color: "#ef4444", fontSize: 11, marginTop: 4, display: "block", fontWeight: 600 }}>
                    {regErrors.securityKey}
                  </span>
                )}
              </div>

              {/* Full Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    if (regErrors.fullName) setRegErrors((p) => ({ ...p, fullName: undefined }));
                  }}
                  placeholder="e.g. Ramesh Adhikari"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: regErrors.fullName ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
                {regErrors.fullName && (
                  <span style={{ color: "#ef4444", fontSize: 11, marginTop: 4, display: "block", fontWeight: 600 }}>
                    {regErrors.fullName}
                  </span>
                )}
              </div>

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (regErrors.email) setRegErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="ramesh.admin@googledoko.com"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: regErrors.email ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
                {regErrors.email && (
                  <span style={{ color: "#ef4444", fontSize: 11, marginTop: 4, display: "block", fontWeight: 600 }}>
                    {regErrors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Password * (Min 8 chars)
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    if (regErrors.password) setRegErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="Create secure admin password"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: regErrors.password ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
                {regErrors.password && (
                  <span style={{ color: "#ef4444", fontSize: 11, marginTop: 4, display: "block", fontWeight: 600 }}>
                    {regErrors.password}
                  </span>
                )}
              </div>

              {/* Confirm */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => {
                    setRegConfirm(e.target.value);
                    if (regErrors.confirm) setRegErrors((p) => ({ ...p, confirm: undefined }));
                  }}
                  placeholder="Re-enter password"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: regErrors.confirm ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
                {regErrors.confirm && (
                  <span style={{ color: "#ef4444", fontSize: 11, marginTop: 4, display: "block", fontWeight: 600 }}>
                    {regErrors.confirm}
                  </span>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #047857 0%, #065f46 100%)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(4, 120, 87, 0.3)",
                  transition: "opacity 0.2s",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Provisioning..." : "Provision Admin Account"}
              </button>
            </form>
          )}

          {/* Security Notice Footer */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #f1f5f9",
              textAlign: "center",
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            🔒 Protected administrative portal. Authorized personnel only.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
