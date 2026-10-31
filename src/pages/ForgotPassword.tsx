import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AuthShell from "../components/auth/AuthShell";
import { api } from "../api/client";

const forgotSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Please enter your email address")
    .trim(),
});

type ForgotFormData = yup.InferType<typeof forgotSchema>;

function ForgotPassword() {
  const [busy, setBusy] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: yupResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const email = watch("email");

  async function onSubmit(data: ForgotFormData) {
    if (busy) return;
    setBusy(true);
    setServerError("");
    const targetEmail = data.email.trim();
    try {
      const result = await api.forgotPassword(targetEmail);
      setSubmittedEmail(targetEmail);
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not send reset link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="auth-card">
        {sent ? (
          <>
            <h1>Reset Token Ready</h1>
            <p className="auth-lead">
              If an account is associated with <strong>{submittedEmail}</strong>, your verification code is ready.
            </p>
            {resetToken ? (
              <div style={{ background: "#f3f4f6", padding: "12px 16px", borderRadius: "8px", margin: "1rem 0", textAlign: "center" }}>
                <span style={{ fontSize: "13px", color: "#6b7280", display: "block" }}>Your Reset Verification Code:</span>
                <strong style={{ fontSize: "20px", letterSpacing: "2px", color: "#111827" }}>{resetToken}</strong>
              </div>
            ) : null}
            <Link
              to={`/reset-password?email=${encodeURIComponent(submittedEmail)}${resetToken ? `&token=${encodeURIComponent(resetToken)}` : ""}`}
              className="auth-btn"
              style={{ textAlign: "center", textDecoration: "none", marginBottom: "0.75rem" }}
            >
              Continue to Reset Password
            </Link>
            <Link to="/login" className="auth-back" style={{ textAlign: "center", display: "block" }}>
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <h1>Forgot your password?</h1>
            <p className="auth-lead">
              Enter the email address associated with your account and we&apos;ll
              send you a password reset link.
            </p>
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <label className="auth-field">
                <span>Email Address</span>
                <input
                  type="email"
                  {...register("email")}
                  value={email || ""}
                  style={{ borderColor: errors.email ? "#ef4444" : undefined }}
                  onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
                {errors.email?.message && (
                  <span className="auth-field-error" style={{ color: "#ef4444", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.email.message}
                  </span>
                )}
              </label>
              {serverError ? <p className="auth-error">{serverError}</p> : null}
              <button type="submit" className="auth-btn" disabled={busy}>
                {busy ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <Link to="/login" className="auth-back">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default ForgotPassword;
