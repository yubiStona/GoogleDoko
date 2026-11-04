import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  FileText,
  ImagePlus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  User,
  Wheat,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AuthShell from "../components/auth/AuthShell";
import AuthPasswordField from "../components/auth/AuthPasswordField";
import { postLoginPath, useAccount } from "../context/AccountContext";
import {
  NEPAL_DISTRICTS,
  PRODUCT_CATEGORIES,
  VENDOR_LOCATIONS,
  VENDOR_TYPES,
} from "../data/authOptions";
import {
  fileToDataUrl,
  isNepalMobile,
  isStrongPassword,
} from "../utils/fileToDataUrl";
import {
  getFormErrorScrollHandler,
  scrollToElement,
  scrollToFirstError,
  mapBackendErrorToField,
} from "../utils/formErrorNavigation";

const signUpVendorSchema = yup.object({
  fullName: yup.string().required("Please enter owner's full name").trim(),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Please enter email address")
    .trim(),
  phone: yup
    .string()
    .required("Enter a valid 10-digit Nepal phone number")
    .test(
      "is-nepal-phone",
      "Enter a valid 10-digit Nepal phone number",
      (val) => isNepalMobile(val || ""),
    ),
  password: yup
    .string()
    .required("Password is required")
    .test(
      "is-strong",
      "Use at least 8 characters with a mix of letters and numbers",
      (val) => isStrongPassword(val || ""),
    ),
  confirm: yup
    .string()
    .required("Please confirm password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
  businessName: yup
    .string()
    .required("Please enter your business or farm name")
    .trim(),
  vendorType: yup
    .string()
    .required("Please select your vendor / farm business type"),
  location: yup
    .string()
    .required("Please select your business / farm location"),
  district: yup.string().required("Please select your district"),
  address: yup
    .string()
    .required("Please enter your full street or farm address")
    .trim(),
  category: yup.string().required("Please select a primary product category"),
  mainProducts: yup.string().default("").trim(),
  description: yup.string().default("").trim(),
  agreed: yup
    .boolean()
    .oneOf(
      [true],
      "Please agree to the Terms & Conditions and Vendor Policy to proceed.",
    )
    .required(),
});

type VendorFormData = yup.InferType<typeof signUpVendorSchema>;

function SignUpVendor() {
  const navigate = useNavigate();
  const { isLoggedIn, registerVendor, user } = useAccount();
  const photoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: yupResolver(signUpVendorSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirm: "",
      businessName: "",
      vendorType: "",
      location: "",
      district: "",
      address: "",
      category: "",
      mainProducts: "",
      description: "",
      agreed: false,
    },
  });

  const fullName = watch("fullName");
  const email = watch("email");
  const phone = watch("phone");
  const password = watch("password");
  const confirm = watch("confirm");
  const businessName = watch("businessName");
  const vendorType = watch("vendorType");
  const location = watch("location");
  const district = watch("district");
  const address = watch("address");
  const category = watch("category");
  const mainProducts = watch("mainProducts");
  const description = watch("description");
  const agreed = watch("agreed");

  if (isLoggedIn) {
    return <Navigate to={postLoginPath(user.role)} replace />;
  }

  async function onPhoto(file?: File | null) {
    if (!file) return;
    setPhotoError("");
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo must be 5 MB or less");
      return;
    }
    try {
      setPhoto(await fileToDataUrl(file));
      setPhotoError("");
    } catch (err: any) {
      setPhotoError(err?.message || "Could not read that photo. Try another image.");
    }
  }

  async function validateStep(current: number) {
    if (current === 1) {
      const valid = await trigger([
        "fullName",
        "email",
        "phone",
        "password",
        "confirm",
      ]);
      if (!valid) {
        setServerError(
          "Please resolve errors in owner account details before continuing",
        );
        setTimeout(() => scrollToFirstError(), 50);
        return false;
      }
    }
    if (current === 2) {
      const valid = await trigger([
        "businessName",
        "vendorType",
        "location",
        "district",
        "address",
      ]);
      if (!valid) {
        setServerError(
          "Please complete the required business and address information",
        );
        setTimeout(() => scrollToFirstError(), 50);
        return false;
      }
    }
    setServerError("");
    return true;
  }

  async function onSubmit(data: VendorFormData) {
    setServerError("");
    setLoading(true);
    const result = await registerVendor({
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      password: data.password,
      vendor: {
        businessName: data.businessName.trim(),
        vendorType: data.vendorType,
        location: data.location,
        district: data.district,
        address: data.address.trim(),
        category: data.category,
        mainProducts: data.mainProducts?.trim() || "",
        description: data.description?.trim() || "",
        photo,
        documentName,
      },
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
    navigate("/signup/vendor/status", {
      replace: true,
      state: {
        registered: true,
        email: data.email.trim(),
      },
    });
  }

  const phoneIsValid = isNepalMobile(phone || "");

  return (
    <AuthShell wide>
      <div className="auth-card auth-card-wide auth-card-register vendor-register-card">
        {/* Role Switcher Pill */}
        <div
          className="auth-role-tabs"
          role="tablist"
          aria-label="Account Type"
        >
          <Link
            to="/signup/customer"
            className="auth-role-tab"
            role="tab"
            aria-selected="false"
          >
            <ShoppingBag size={18} />
            <span>Customer Account</span>
          </Link>
          <Link
            to="/signup/vendor"
            className="auth-role-tab active"
            role="tab"
            aria-selected="true"
          >
            <Store size={18} />
            <span>Vendor / Farmer Partner</span>
          </Link>
        </div>

        <div className="auth-header-group">
          <p className="auth-kicker">Partner With GoogleDoko</p>
          <h1>Register as a Vendor or Local Farmer</h1>
          <p className="auth-lead">
            Sell authentic local produce, organic goods, and regional
            specialties directly to buyers across Nepal.
          </p>
        </div>

        {/* Step Wizard Progress */}
        <ol
          className="auth-progress vendor-progress"
          aria-label="Registration Steps"
        >
          <li className={step === 1 ? "current" : "done"}>
            {step > 1 ? <Check size={14} /> : <User size={14} />}
            <span>1. Owner Account</span>
          </li>
          <li className={step === 2 ? "current" : step > 2 ? "done" : ""}>
            {step > 2 ? <Check size={14} /> : <Store size={14} />}
            <span>2. Farm &amp; Business</span>
          </li>
          <li className={step === 3 ? "current" : ""}>
            <Wheat size={14} />
            <span>3. Products &amp; Verification</span>
          </li>
        </ol>

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit, getFormErrorScrollHandler())}
          noValidate
        >
          {/* STEP 1: Owner & Account */}
          {step === 1 ? (
            <div className="auth-section-card">
              <h3 className="auth-section-title">
                <span className="auth-section-num">1</span>
                Owner &amp; Account Information
              </h3>

              <div className="auth-form-grid">
                <label
                  className={`auth-field${errors.fullName ? " invalid" : ""}`}
                >
                  <span>Owner Full Name *</span>
                  <input
                    {...register("fullName")}
                    value={fullName || ""}
                    onChange={(event) =>
                      setValue("fullName", event.target.value, {
                        shouldValidate: true,
                      })
                    }
                    placeholder="e.g. Ram Bahadur Thapa"
                    autoComplete="name"
                    required
                  />
                  {errors.fullName?.message && (
                    <span
                      className="auth-field-error"
                      style={{ color: "#ef4444", fontSize: 12 }}
                    >
                      {errors.fullName.message}
                    </span>
                  )}
                </label>

                <label
                  className={`auth-field${errors.email ? " invalid" : ""}`}
                >
                  <span>Business Email Address *</span>
                  <input
                    type="email"
                    {...register("email")}
                    value={email || ""}
                    onChange={(event) =>
                      setValue("email", event.target.value, {
                        shouldValidate: true,
                      })
                    }
                    placeholder="farm@example.com"
                    autoComplete="email"
                    required
                  />
                  {errors.email?.message && (
                    <span
                      className="auth-field-error"
                      style={{ color: "#ef4444", fontSize: 12 }}
                    >
                      {errors.email.message}
                    </span>
                  )}
                </label>

                <label
                  className={`auth-field auth-full-width${errors.phone ? " invalid" : ""}`}
                >
                  <span className="auth-field-label-row">
                    <span>Mobile Phone Number *</span>
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
                      placeholder="98XXXXXXXX"
                      autoComplete="tel"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  {errors.phone?.message ? (
                    <span
                      className="auth-field-error"
                      style={{ color: "#ef4444", fontSize: 12 }}
                    >
                      {errors.phone.message}
                    </span>
                  ) : (
                    <small className="auth-field-hint">
                      10 digits starting with 9 for order SMS &amp; call updates
                    </small>
                  )}
                </label>
              </div>

              <div className="auth-form-grid">
                <AuthPasswordField
                  label="Account Password *"
                  value={password || ""}
                  onChange={(val) =>
                    setValue("password", val, { shouldValidate: true })
                  }
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  showStrength
                  error={errors.password?.message}
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
          ) : null}

          {/* STEP 2: Business & Farm Information */}
          {step === 2 ? (
            <div className="auth-section-card">
              <h3 className="auth-section-title">
                <span className="auth-section-num">2</span>
                Farm &amp; Business Profile
              </h3>

              <div className="auth-form-grid">
                <label
                  className={`auth-field auth-full-width${errors.businessName ? " invalid" : ""}`}
                >
                  <span>Business / Farm / Brand Name *</span>
                  <input
                    {...register("businessName")}
                    value={businessName || ""}
                    onChange={(event) =>
                      setValue("businessName", event.target.value, {
                        shouldValidate: true,
                      })
                    }
                    placeholder="e.g. Ilam Organic Tea Estate, Mustang Apple Orchards"
                    required
                  />
                  {errors.businessName?.message && (
                    <span
                      className="auth-field-error"
                      style={{ color: "#ef4444", fontSize: 12 }}
                    >
                      {errors.businessName.message}
                    </span>
                  )}
                </label>

                <label
                  className={`auth-field${errors.vendorType ? " invalid" : ""}`}
                >
                  <span>Business Type *</span>
                  <select
                    {...register("vendorType")}
                    value={vendorType || ""}
                    onChange={(event) =>
                      setValue("vendorType", event.target.value, {
                        shouldValidate: true,
                      })
                    }
                    required
                  >
                    <option value="">Select business type</option>
                    {VENDOR_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.vendorType?.message && (
                    <span
                      className="auth-field-error"
                      style={{ color: "#ef4444", fontSize: 12 }}
                    >
                      {errors.vendorType.message}
                    </span>
                  )}
                </label>

                <label
                  className={`auth-field${errors.location ? " invalid" : ""}`}
                >
                  <span>Region / Zone *</span>
                  <select
                    {...register("location")}
                    value={location || ""}
                    onChange={(event) =>
                      setValue("location", event.target.value, {
                        shouldValidate: true,
                      })
                    }
                    required
                  >
                    <option value="">Select location / region</option>
                    {VENDOR_LOCATIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.location?.message && (
                    <span
                      className="auth-field-error"
                      style={{ color: "#ef4444", fontSize: 12 }}
                    >
                      {errors.location.message}
                    </span>
                  )}
                </label>

                <label
                  className={`auth-field${errors.district ? " invalid" : ""}`}
                >
                  <span>District *</span>
                  <select
                    {...register("district")}
                    value={district || ""}
                    onChange={(event) =>
                      setValue("district", event.target.value, {
                        shouldValidate: true,
                      })
                    }
                    required
                  >
                    <option value="">Select district</option>
                    {NEPAL_DISTRICTS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.district?.message && (
                    <span
                      className="auth-field-error"
                      style={{ color: "#ef4444", fontSize: 12 }}
                    >
                      {errors.district.message}
                    </span>
                  )}
                </label>

                <label
                  className={`auth-field auth-full-width${errors.address ? " invalid" : ""}`}
                >
                  <span>Full Physical Address / Village / Ward *</span>
                  <textarea
                    rows={2}
                    {...register("address")}
                    value={address || ""}
                    onChange={(event) =>
                      setValue("address", event.target.value, {
                        shouldValidate: true,
                      })
                    }
                    placeholder="Ward number, tole, village or municipal location"
                    required
                  />
                  {errors.address?.message && (
                    <span
                      className="auth-field-error"
                      style={{ color: "#ef4444", fontSize: 12 }}
                    >
                      {errors.address.message}
                    </span>
                  )}
                </label>
              </div>
            </div>
          ) : null}

          {/* STEP 3: Products & Verification */}
          {step === 3 ? (
            <>
              <div className="auth-section-card">
                <h3 className="auth-section-title">
                  <span className="auth-section-num">3</span>
                  Product Specialization
                </h3>

                <div className="auth-form-grid">
                  <label
                    className={`auth-field${errors.category ? " invalid" : ""}`}
                  >
                    <span>Primary Product Category *</span>
                    <select
                      {...register("category")}
                      value={category || ""}
                      onChange={(event) =>
                        setValue("category", event.target.value, {
                          shouldValidate: true,
                        })
                      }
                      required
                    >
                      <option value="">Select primary category</option>
                      {PRODUCT_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {errors.category?.message && (
                      <span
                        className="auth-field-error"
                        style={{ color: "#ef4444", fontSize: 12 }}
                      >
                        {errors.category.message}
                      </span>
                    )}
                  </label>

                  <label className="auth-field">
                    <span>
                      Main Products{" "}
                      <em className="auth-optional">(optional)</em>
                    </span>
                    <input
                      {...register("mainProducts")}
                      value={mainProducts || ""}
                      onChange={(event) =>
                        setValue("mainProducts", event.target.value)
                      }
                      placeholder="e.g. Organic Black Tea, Mustang Apples, Raw Honey"
                    />
                  </label>

                  <label className="auth-field auth-full-width">
                    <span>
                      Business / Farm Story{" "}
                      <em className="auth-optional">(optional)</em>
                    </span>
                    <textarea
                      rows={3}
                      {...register("description")}
                      value={description || ""}
                      onChange={(event) =>
                        setValue("description", event.target.value)
                      }
                      placeholder="Tell buyers about your harvest methods, heritage, or farm location..."
                    />
                  </label>
                </div>
              </div>

              <div className="auth-section-card">
                <h3 className="auth-section-title">
                  <span className="auth-section-num">4</span>
                  Storefront Photo &amp; Document Verification
                </h3>

                <p className="auth-verify-copy">
                  Our quality team reviews your store profile to ensure
                  authentic Nepali origin and buyer trust.
                </p>

                <div className="auth-upload-row">
                  <div className="auth-upload">
                    <span>
                      Storefront / Farm Photo{" "}
                      <em className="auth-optional">(optional)</em>
                    </span>
                    <div
                      className={`auth-upload-area${photoError ? " invalid" : ""}`}
                      onClick={() => photoRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && photoRef.current?.click()
                      }
                    >
                      {photo ? (
                        <div className="auth-upload-preview-wrap">
                          <img src={photo} alt="Farm preview" />
                          <button
                            type="button"
                            className="auth-preview-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhoto("");
                              setPhotoError("");
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <ImagePlus size={26} strokeWidth={1.6} />
                          <em>Click to upload farm or produce photo (max 5MB)</em>
                        </>
                      )}
                      <Camera size={16} className="auth-upload-cam" />
                    </div>
                    {photoError ? (
                      <em className="auth-field-error" style={{ color: "#ef4444", fontSize: 12, marginTop: 4, display: "block" }}>
                        {photoError}
                      </em>
                    ) : null}
                    <input
                      ref={photoRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) => onPhoto(event.target.files?.[0])}
                    />
                  </div>

                  <div className="auth-upload">
                    <span>
                      PAN / Farm Certificate{" "}
                      <em className="auth-optional">(optional)</em>
                    </span>
                    <div
                      className="auth-upload-area"
                      onClick={() => docRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && docRef.current?.click()
                      }
                    >
                      <FileText size={26} strokeWidth={1.6} />
                      <em>
                        {documentName ||
                          "Upload PAN or Farm Registration (PDF / JPG)"}
                      </em>
                    </div>
                    <input
                      ref={docRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      hidden
                      onChange={(event) =>
                        setDocumentName(event.target.files?.[0]?.name ?? "")
                      }
                    />
                  </div>
                </div>

                <div className="auth-agreement-box">
                  <label
                    className={`auth-check${errors.agreed ? " invalid" : ""}`}
                  >
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
                      I agree to the{" "}
                      <Link to="/about" target="_blank">
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/about" target="_blank">
                        Vendor Partnership Policy
                      </Link>
                      .
                    </span>
                  </label>
                  {errors.agreed?.message && (
                    <span
                      className="auth-field-error"
                      style={{
                        color: "#ef4444",
                        fontSize: 12,
                        display: "block",
                        marginTop: 4,
                      }}
                    >
                      {errors.agreed.message}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {serverError ? (
            <p className="auth-error" role="alert">
              {serverError}
            </p>
          ) : null}

          <div className="auth-step-actions">
            {step > 1 ? (
              <button
                type="button"
                className="auth-btn ghost"
                onClick={() => {
                  setServerError("");
                  setStep((value) => value - 1);
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                className="auth-btn"
                onClick={async () => {
                  if (await validateStep(step)) {
                    setStep((value) => value + 1);
                  }
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="auth-btn auth-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Submitting Application..."
                  : "Submit Vendor Application"}
              </button>
            )}
          </div>

          <div className="auth-trust-badges">
            <div className="auth-trust-badge">
              <ShieldCheck size={16} />
              <span>Verified Seller Network</span>
            </div>
            <div className="auth-trust-badge">
              <span>🌾</span>
              <span>Direct Farm-to-Table</span>
            </div>
            <div className="auth-trust-badge">
              <Check size={16} />
              <span>Timely Bi-Weekly Payouts</span>
            </div>
          </div>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" state={{ role: "vendor", from: "/vendor" }}>
            Log in here
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default SignUpVendor;
