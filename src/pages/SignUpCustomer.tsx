import {
  Camera,
  Check,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AuthShell from "../components/auth/AuthShell";
import AuthPasswordField from "../components/auth/AuthPasswordField";
import { postLoginPath, useAccount } from "../context/AccountContext";
import {
  fileToDataUrl,
  isNepalMobile,
  isStrongPassword,
} from "../utils/fileToDataUrl";
import {
  getFormErrorScrollHandler,
  scrollToElement,
  mapBackendErrorToField,
} from "../utils/formErrorNavigation";

const POPULAR_CITIES = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Chitwan",
  "Biratnagar",
  "Dharan",
  "Butwal",
];

const signUpCustomerSchema = yup.object({
  fullName: yup.string().required("Enter your full name").trim(),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Enter your email address")
    .trim(),
  phone: yup
    .string()
    .required("Enter your phone number")
    .test(
      "is-nepal-phone",
      "Use a 10-digit number starting with 9 (e.g. 9812345678)",
      (val) => isNepalMobile(val || ""),
    ),
  password: yup
    .string()
    .required("Enter a password")
    .test("is-strong", "Use 8+ characters with letters and numbers", (val) =>
      isStrongPassword(val || ""),
    ),
  confirm: yup
    .string()
    .required("Confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
  city: yup.string().required("Enter or select your city").trim(),
  address: yup.string().default("").trim(),
  agreed: yup
    .boolean()
    .oneOf([true], "Please agree to the Terms & Privacy to continue")
    .required(),
});

type CustomerFormData = yup.InferType<typeof signUpCustomerSchema>;

function SignUpCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const { isLoggedIn, registerCustomer, user } = useAccount();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: yupResolver(signUpCustomerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirm: "",
      city: "",
      address: "",
      agreed: false,
    },
  });

  const fullName = watch("fullName");
  const email = watch("email");
  const phone = watch("phone");
  const password = watch("password");
  const confirm = watch("confirm");
  const city = watch("city");
  const address = watch("address");
  const agreed = watch("agreed");

  if (isLoggedIn) {
    return <Navigate to={postLoginPath(user.role, from)} replace />;
  }

  async function onPhoto(file?: File | null) {
    if (!file) {
      return;
    }
    setPhotoError("");
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Profile photo must be 5 MB or less");
      return;
    }
    try {
      setPhoto(await fileToDataUrl(file));
      setPhotoError("");
    } catch (err: any) {
      setPhotoError(err?.message || "Could not read that photo. Try another image.");
    }
  }

  async function onSubmit(data: CustomerFormData) {
    setServerError("");
    setLoading(true);
    const result = await registerCustomer({
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      password: data.password,
      address: data.address?.trim() || "",
      city: data.city.trim(),
      photo,
    });
    setLoading(false);
    if (result) {
      setServerError(result);
      const { targetSelector } = mapBackendErrorToField(result);
      setTimeout(() => {
        const el = targetSelector ? document.querySelector<HTMLElement>(targetSelector) : document.querySelector<HTMLElement>(".auth-error");
        if (el) scrollToElement(el, { focusField: true });
      }, 50);
      return;
    }
    navigate("/login", {
      replace: true,
      state: {
        signup: true,
        email: data.email.trim(),
        role: "customer",
        from,
      },
    });
  }

  const phoneIsValid = isNepalMobile(phone || "");

  return (
    <AuthShell wide>
      <div className="auth-card auth-card-register customer-register-card">
        {/* Role Switcher Pill */}
        <div
          className="auth-role-tabs"
          role="tablist"
          aria-label="Account Type"
        >
          <Link
            to="/signup/customer"
            className="auth-role-tab active"
            role="tab"
            aria-selected="true"
          >
            <ShoppingBag size={18} />
            <span>Customer Account</span>
          </Link>
          <Link
            to="/signup/vendor"
            className="auth-role-tab"
            role="tab"
            aria-selected="false"
          >
            <Store size={18} />
            <span>Vendor / Farmer Partner</span>
          </Link>
        </div>

        <div className="auth-header-group">
          <p className="auth-kicker">Join GoogleDoko Shoppers</p>
          <h1>Create your customer account</h1>
          <p className="auth-lead">
            Discover and order fresh local produce, organic goods, and authentic
            foods directly from Nepal’s farms to your door.
          </p>
        </div>

        <ol className="auth-progress" aria-hidden="true">
          <li className="done">
            <Check size={14} /> Account Type
          </li>
          <li className="current">Personal Details</li>
          <li>Ready to Shop</li>
        </ol>

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit, getFormErrorScrollHandler())}
          noValidate
        >
          {/* Section 1: Personal Details */}
          <div className="auth-section-card">
            <h3 className="auth-section-title">
              <span className="auth-section-num">1</span>
              Personal Information
            </h3>

            <div className="auth-form-grid">
              <label
                className={`auth-field${errors.fullName ? " invalid" : ""}`}
              >
                <span>Full Name *</span>
                <input
                  {...register("fullName")}
                  value={fullName || ""}
                  onChange={(e) =>
                    setValue("fullName", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  placeholder="e.g. Sita Sharma"
                  autoComplete="name"
                  required
                />
                {errors.fullName ? (
                  <em className="auth-field-error">
                    {errors.fullName.message}
                  </em>
                ) : null}
              </label>

              <label className={`auth-field${errors.email ? " invalid" : ""}`}>
                <span>Email Address *</span>
                <input
                  type="email"
                  {...register("email")}
                  value={email || ""}
                  onChange={(e) =>
                    setValue("email", e.target.value, { shouldValidate: true })
                  }
                  placeholder="you@email.com"
                  autoComplete="email"
                  required
                />
                {errors.email ? (
                  <em className="auth-field-error">{errors.email.message}</em>
                ) : null}
              </label>

              <label className={`auth-field${errors.phone ? " invalid" : ""}`}>
                <span className="auth-field-label-row">
                  <span>Phone Number *</span>
                  {phoneIsValid ? (
                    <span className="auth-valid-badge">
                      <Check size={12} /> Valid Nepal Number
                    </span>
                  ) : null}
                </span>
                <div className="auth-phone-input-wrap">
                  <span className="auth-phone-prefix">+977</span>
                  <input
                    type="tel"
                    {...register("phone")}
                    value={phone || ""}
                    onChange={(event) =>
                      setValue(
                        "phone",
                        event.target.value.replace(/\D/g, "").slice(0, 10),
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                    placeholder="9XXXXXXXX"
                    autoComplete="tel"
                    inputMode="numeric"
                    required
                  />
                </div>
                {errors.phone ? (
                  <em className="auth-field-error">{errors.phone.message}</em>
                ) : (
                  <small className="auth-field-hint">
                    Must start with 9 (10 digits)
                  </small>
                )}
              </label>

              <div className="auth-upload-compact">
                <span>
                  Profile Photo <em className="auth-optional">(optional)</em>
                </span>
                <div className="auth-upload-compact-row">
                  <div
                    className={`auth-upload-avatar-circle${photoError ? " invalid" : ""}`}
                    onClick={() => fileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload photo"
                    onKeyDown={(e) =>
                      e.key === "Enter" && fileRef.current?.click()
                    }
                  >
                    {photo ? (
                      <img src={photo} alt="Avatar preview" />
                    ) : (
                      <UserRound size={26} strokeWidth={1.7} />
                    )}
                    <span
                      className="auth-upload-cam-badge"
                      title="Change photo"
                    >
                      <Camera size={14} />
                    </span>
                  </div>
                  <div className="auth-upload-meta">
                    <button
                      type="button"
                      className="auth-upload-btn-text"
                      onClick={() => fileRef.current?.click()}
                    >
                      {photo ? "Change photo" : "Select photo"}
                    </button>
                    {photo ? (
                      <button
                        type="button"
                        className="auth-upload-btn-remove"
                        onClick={() => {
                          setPhoto("");
                          setPhotoError("");
                        }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    ) : (
                      <p className="auth-upload-subtext">JPG, PNG or WebP (max 5MB)</p>
                    )}
                    {photoError ? (
                      <em className="auth-field-error" style={{ color: "#ef4444", fontSize: 12, marginTop: 4, display: "block" }}>
                        {photoError}
                      </em>
                    ) : null}
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => onPhoto(event.target.files?.[0])}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location & Delivery */}
          <div className="auth-section-card">
            <h3 className="auth-section-title">
              <span className="auth-section-num">2</span>
              Location &amp; Delivery Address
            </h3>

            <div className="auth-form-grid">
              <div className="auth-full-width">
                <label className={`auth-field${errors.city ? " invalid" : ""}`}>
                  <span>City / Municipality *</span>
                  <div className="auth-input-with-icon">
                    <MapPin size={18} className="auth-input-icon" />
                    <input
                      {...register("city")}
                      value={city || ""}
                      onChange={(event) =>
                        setValue("city", event.target.value, {
                          shouldValidate: true,
                        })
                      }
                      placeholder="e.g. Kathmandu, Pokhara, Lalitpur"
                      required
                    />
                  </div>
                  {errors.city ? (
                    <em className="auth-field-error">{errors.city.message}</em>
                  ) : null}
                </label>

                <div className="auth-quick-chips">
                  <span className="auth-quick-chips-label">
                    Popular cities:
                  </span>
                  <div className="auth-chips-scroll">
                    {POPULAR_CITIES.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className={`auth-chip${city === name ? " selected" : ""}`}
                        onClick={() =>
                          setValue("city", name, { shouldValidate: true })
                        }
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="auth-full-width">
                <label className="auth-field">
                  <span>
                    Street Address / Landmark{" "}
                    <em className="auth-optional">(optional)</em>
                  </span>
                  <textarea
                    rows={2}
                    {...register("address")}
                    value={address || ""}
                    onChange={(event) =>
                      setValue("address", event.target.value)
                    }
                    placeholder="Tole, ward number, nearby landmark for fast local delivery"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Security */}
          <div className="auth-section-card">
            <h3 className="auth-section-title">
              <span className="auth-section-num">3</span>
              Account Security
            </h3>

            <div className="auth-form-grid">
              <AuthPasswordField
                label="Create Password *"
                value={password || ""}
                onChange={(val) =>
                  setValue("password", val, { shouldValidate: true })
                }
                placeholder="At least 8 characters"
                autoComplete="new-password"
                error={errors.password?.message}
                showStrength
              />

              <AuthPasswordField
                label="Confirm Password *"
                value={confirm || ""}
                onChange={(val) =>
                  setValue("confirm", val, { shouldValidate: true })
                }
                placeholder="Re-enter your password"
                autoComplete="new-password"
                error={errors.confirm?.message}
              />
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="auth-agreement-box">
            <label className={`auth-check${errors.agreed ? " invalid" : ""}`}>
              <input
                type="checkbox"
                {...register("agreed")}
                checked={Boolean(agreed)}
                onChange={(event) =>
                  setValue("agreed", event.target.checked, {
                    shouldValidate: true,
                  })
                }
              />
              <span>
                I agree to GoogleDoko’s{" "}
                <Link to="/about" target="_blank">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link to="/about" target="_blank">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.agreed ? (
              <em className="auth-field-error">{errors.agreed.message}</em>
            ) : null}
          </div>

          {serverError ? (
            <p className="auth-error" role="alert">
              {serverError}
            </p>
          ) : null}

          <button
            type="submit"
            className="auth-btn auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating your account..." : "Create Customer Account"}
          </button>

          {/* Trust Badges */}
          <div className="auth-trust-badges">
            <div className="auth-trust-badge">
              <ShieldCheck size={16} />
              <span>Safe &amp; Encrypted</span>
            </div>
            <div className="auth-trust-badge">
              <span>🇳🇵</span>
              <span>100% Nepali Produce</span>
            </div>
            <div className="auth-trust-badge">
              <Check size={16} />
              <span>Free to Join</span>
            </div>
          </div>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default SignUpCustomer;
