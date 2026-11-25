import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AuthShell from "../components/auth/AuthShell";
import AuthPasswordField from "../components/auth/AuthPasswordField";
import { postLoginPath, useAccount } from "../context/AccountContext";
import { type AccountRole } from "../data/authOptions";
import loginProduceImage from "../assets/images/login-produce.jpg";
import { getFormErrorScrollHandler, scrollToElement } from "../utils/formErrorNavigation";
import { adminVendorPortalUrl } from "../utils/adminVendorPortal";
import { getToken } from "../api/client";

const loginSchema = yup.object({
  identifier: yup
    .string()
    .required("Email or phone number is required")
    .test("valid-ident", "Enter a valid email address or 10-digit mobile number", (val) => {
      if (!val) return false;
      const s = val.trim();
      if (s.includes("@")) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
      }
      const digits = s.replace(/\D/g, "");
      return digits.length === 10;
    })
    .trim(),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  remember: yup.boolean().default(true),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

function Login() {
  const location = useLocation();
  const { login, isLoggedIn, loadingSession, user } = useAccount();
  const signupState =
    (location.state as {
      from?: string;
      email?: string;
      role?: AccountRole;
      signup?: boolean;
    } | null) ?? {};
  const from = signupState.from;
  const searchParams = new URLSearchParams(location.search);
  const paramRole = searchParams.get("role") as AccountRole | null;
  const initialRole: AccountRole =
    signupState.role ??
    (paramRole === "vendor" || paramRole === "customer"
      ? paramRole
      : from?.startsWith("/vendor")
      ? "vendor"
      : "customer");
  const [role, setRole] = useState<AccountRole>(initialRole);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const signupNotice = signupState.signup
    ? "Account created. Please log in to continue."
    : "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      identifier: signupState.email ?? "",
      password: "",
      remember: true,
    },
  });

  const identifier = watch("identifier");
  const password = watch("password");
  const remember = watch("remember");

  if (loadingSession) {
    return (
      <main className="auth-gate-page" role="status">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Verifying session…</p>
        </div>
      </main>
    );
  }

  if (isLoggedIn) {
    if (user.role === "vendor" || user.role === "admin") {
      const token = getToken();
      const portalPath = user.role === "admin" ? "/admin" : "/vendor";
      const target = adminVendorPortalUrl(
        token ? `${portalPath}?auth_token=${encodeURIComponent(token)}` : portalPath
      );
      window.location.replace(target);
      return null;
    }
    return <Navigate to={postLoginPath(user.role, from)} replace />;
  }

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    setServerError("");
    const result = await login(data.identifier, data.password, Boolean(data.remember), role);
    setLoading(false);
    if (result) {
      setServerError(result);
      setTimeout(() => {
        const errorEl = document.querySelector<HTMLElement>(".auth-error");
        if (errorEl) scrollToElement(errorEl, { focusField: true });
      }, 50);
    }
  }

  return (
    <AuthShell wide>
      <div className="auth-login-split">
        <aside className="auth-login-visual">
          <img
            src={loginProduceImage}
            alt="Fresh Produce Directly from Local Farmers"
          />
        </aside>

        <div className="auth-card auth-login-form">
          <h1>Welcome back to GoogleDoko</h1>
          <p className="auth-lead">
            {role === "vendor"
              ? "Log in to manage your vendor store, fresh produce, and orders."
              : "Log in to continue shopping with GoogleDoko."}
          </p>
          {signupNotice ? <p className="auth-signup-notice">{signupNotice}</p> : null}

          <div className="auth-role-toggle" role="tablist">
            <button
              type="button"
              className={role === "customer" ? "active" : ""}
              onClick={() => {
                setRole("customer");
                setServerError("");
              }}
            >
              Customer
            </button>
            <button
              type="button"
              className={role === "vendor" ? "active" : ""}
              onClick={() => {
                const token = getToken();
                const target = adminVendorPortalUrl(
                  token ? `/vendor?auth_token=${encodeURIComponent(token)}` : "/login?role=vendor"
                );
                window.location.assign(target);
              }}
            >
              Vendor login
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit, getFormErrorScrollHandler())} noValidate>
            <label className={`auth-field${errors.identifier ? " invalid" : ""}`}>
              <span>Email / Phone Number</span>
              <input
                {...register("identifier")}
                value={identifier}
                style={{ borderColor: errors.identifier ? "#ef4444" : undefined }}
                onChange={(event) => {
                  setValue("identifier", event.target.value, { shouldValidate: true });
                  if (serverError) setServerError("");
                }}
                placeholder="Enter your email or phone number"
                autoComplete="username"
              />
              {errors.identifier?.message && (
                <span className="auth-field-error" style={{ color: "#ef4444", fontSize: 12, marginTop: 4, display: "block" }}>
                  {errors.identifier.message}
                </span>
              )}
            </label>

            <AuthPasswordField
              label="Password"
              value={password || ""}
              onChange={(val) => {
                setValue("password", val, { shouldValidate: true });
                if (serverError) setServerError("");
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              required={false}
              error={errors.password?.message}
            />

            <div className="auth-login-row">
              <label className="auth-check compact">
                <input
                  type="checkbox"
                  checked={Boolean(remember)}
                  onChange={(event) => setValue("remember", event.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot">
                Forgot Password?
              </Link>
            </div>

            {serverError ? <p className="auth-error">{serverError}</p> : null}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link to="/signup">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

export default Login;
