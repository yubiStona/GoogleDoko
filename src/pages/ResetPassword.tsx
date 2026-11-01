import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AuthShell from "../components/auth/AuthShell";
import AuthPasswordField from "../components/auth/AuthPasswordField";
import { api } from "../api/client";
import { isStrongPassword } from "../utils/fileToDataUrl";

const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email address is required")
    .trim(),
  token: yup
    .string()
    .required("Verification token is required")
    .trim(),
  password: yup
    .string()
    .required("New password is required")
    .test("is-strong", "Use 8+ characters with letters and numbers", (val) =>
      isStrongPassword(val || "")
    ),
  confirm: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

type ResetFormData = yup.InferType<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const initialEmail = params.get("email") || "";
  const initialToken = params.get("token") || "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      token: initialToken,
      password: "",
      confirm: "",
    },
  });

  const email = watch("email");
  const token = watch("token");
  const password = watch("password");
  const confirm = watch("confirm");

  async function onSubmit(data: ResetFormData) {
    setBusy(true);
    setServerError("");
    try {
      await api.resetPassword({
        email: data.email.trim(),
        token: data.token.trim(),
        password: data.password,
      });
      setDone(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="auth-card">
        <h1>{done ? "Password updated" : "Set a new password"}</h1>
        {done ? (
          <div>
            <p className="auth-lead" style={{ marginBottom: "1.5rem" }}>
              Your password has been reset successfully. You can now log in with your new credentials.
            </p>
            <Link className="auth-btn" to="/login" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
              Log in
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            <label className="auth-field">
              <span>Email Address</span>
              <input
                type="email"
                {...register("email")}
                value={email || ""}
                style={{ borderColor: errors.email ? "#ef4444" : undefined }}
                onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
                placeholder="Enter your registered email"
                autoComplete="email"
              />
              {errors.email?.message && (
                <span className="auth-field-error" style={{ color: "#ef4444", fontSize: 12, marginTop: 4, display: "block" }}>
                  {errors.email.message}
                </span>
              )}
            </label>

            <label className="auth-field">
              <span>Verification Token</span>
              <input
                type="text"
                {...register("token")}
                value={token || ""}
                style={{ borderColor: errors.token ? "#ef4444" : undefined }}
                onChange={(e) => setValue("token", e.target.value, { shouldValidate: true })}
                placeholder="Enter 8-character verification token"
                autoComplete="off"
              />
              {errors.token?.message && (
                <span className="auth-field-error" style={{ color: "#ef4444", fontSize: 12, marginTop: 4, display: "block" }}>
                  {errors.token.message}
                </span>
              )}
            </label>

            <AuthPasswordField
              label="New password"
              value={password || ""}
              onChange={(val) => setValue("password", val, { shouldValidate: true })}
              placeholder="8+ characters, letters and numbers"
              autoComplete="new-password"
              showStrength
              error={errors.password?.message}
            />
            <AuthPasswordField
              label="Confirm password"
              value={confirm || ""}
              onChange={(val) => setValue("confirm", val, { shouldValidate: true })}
              placeholder="Re-enter password"
              autoComplete="new-password"
              error={errors.confirm?.message}
            />
            {serverError && (
              <p className="auth-error" role="alert">
                {serverError}
              </p>
            )}
            <button className="auth-btn" disabled={busy}>
              {busy ? "Saving…" : "Reset password"}
            </button>
            <Link to="/forgot-password" className="auth-back" style={{ textAlign: "center", display: "block" }}>
              Request a new code
            </Link>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
