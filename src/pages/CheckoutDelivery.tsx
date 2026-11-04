import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import CheckoutShell from "../components/CheckoutShell";
import OrderSummaryCard from "../components/OrderSummaryCard";
import { useCheckout, type AddressType } from "../context/CheckoutContext";
import { scrollToElement, scrollToFirstError } from "../utils/formErrorNavigation";

const provinces = [
  "Bagmati Province",
  "Koshi Province",
  "Madhesh Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

const addressTypes: AddressType[] = ["Home", "Work", "Other"];

const deliverySchema = yup.object({
  fullName: yup.string().required("Enter recipient's full name").trim(),
  phone: yup
    .string()
    .required("Enter 10-digit mobile number")
    .test(
      "is-nepal-phone",
      "Enter a valid 10-digit mobile number starting with 9",
      (val) => /^9\d{9}$/.test((val || "").replace(/\D/g, ""))
    ),
  province: yup.string().required("Select province"),
  district: yup.string().required("Enter district / city").trim(),
  area: yup.string().required("Enter area / neighborhood").trim(),
  street: yup.string().required("Enter street address").trim(),
  landmark: yup.string().default("").trim(),
  postalCode: yup.string().default("").trim(),
  addressType: yup.string().oneOf(["Home", "Work", "Other"]).default("Home"),
});

type DeliveryFormData = yup.InferType<typeof deliverySchema>;

function CheckoutDelivery() {
  const navigate = useNavigate();
  const {
    items,
    addresses,
    selectedAddressId,
    form,
    selectAddress,
    startNewAddress,
    updateForm,
    saveCurrentAddress,
  } = useCheckout();

  const [addressSelectionError, setAddressSelectionError] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    resolver: yupResolver(deliverySchema),
    values: {
      fullName: form.fullName,
      phone: form.phone,
      province: form.province,
      district: form.district,
      area: form.area,
      street: form.street,
      landmark: form.landmark,
      postalCode: form.postalCode,
      addressType: form.addressType,
    },
  });

  const values = watch();

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  async function continueToPayment() {
    // If user has saved addresses but none is chosen and form is not completely filled
    if (
      addresses.length > 0 &&
      !selectedAddressId &&
      (!values.fullName || !values.phone || !values.street || !values.district)
    ) {
      setAddressSelectionError("Please select a delivery address before continuing.");
      const grid = document.querySelector<HTMLElement>(".co-address-grid");
      scrollToElement(grid, { focusField: true });
      return;
    }

    setAddressSelectionError(null);
    const isValid = await trigger();
    if (!isValid) {
      setTimeout(() => {
        scrollToFirstError(document, { focusField: true });
      }, 50);
      return;
    }

    if (!saveCurrentAddress()) {
      return;
    }

    navigate("/checkout/payment");
  }

  const handleFieldChange = (key: keyof DeliveryFormData, value: any) => {
    setAddressSelectionError(null);
    setValue(key, value, { shouldValidate: true });
    updateForm(key as any, value);
  };

  return (
    <CheckoutShell step={1}>
      <div className="checkout-layout">
        <div className="co-main">
          <h1>Select Delivery Address</h1>

          {addressSelectionError && (
            <div className="co-group-error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{addressSelectionError}</span>
            </div>
          )}

          <div className={`co-address-grid ${addressSelectionError ? "has-error" : ""}`}>
            {addresses.map((address) => (
              <button
                type="button"
                key={address.id}
                className={`co-address-card ${selectedAddressId === address.id ? "selected" : ""}`}
                onClick={() => {
                  setAddressSelectionError(null);
                  selectAddress(address.id);
                }}
              >
                <span className="co-address-label">{address.label}</span>
                <strong>{address.title}</strong>
                <p>{address.line}</p>
                <p>Phone: {address.phone}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="co-add-address"
            onClick={() => {
              setAddressSelectionError(null);
              startNewAddress();
            }}
          >
            <Plus size={16} />
            Add New Address
          </button>

          <section className="co-form-card">
            <h2>Recipient Information</h2>

            <form onSubmit={handleSubmit(continueToPayment)} className="co-form-grid" noValidate>
              <label htmlFor="fullName">
                Full Name *
                <input
                  id="fullName"
                  name="fullName"
                  value={values.fullName || ""}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  style={{ borderColor: errors.fullName ? "#ef4444" : undefined }}
                  onChange={(event) => handleFieldChange("fullName", event.target.value)}
                  placeholder="Enter your full name"
                />
                {errors.fullName?.message && (
                  <span id="fullName-error" className="form-field-error-msg" role="alert">
                    <AlertCircle size={13} /> {errors.fullName.message}
                  </span>
                )}
              </label>
              <label htmlFor="phone">
                Phone Number *
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={values.phone || ""}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  style={{ borderColor: errors.phone ? "#ef4444" : undefined }}
                  onChange={(event) => handleFieldChange("phone", event.target.value)}
                  placeholder="Enter 10-digit mobile number"
                />
                {errors.phone?.message && (
                  <span id="phone-error" className="form-field-error-msg" role="alert">
                    <AlertCircle size={13} /> {errors.phone.message}
                  </span>
                )}
              </label>
              <label htmlFor="province">
                Province *
                <select
                  id="province"
                  name="province"
                  value={values.province || provinces[0]}
                  aria-invalid={Boolean(errors.province)}
                  aria-describedby={errors.province ? "province-error" : undefined}
                  style={{ borderColor: errors.province ? "#ef4444" : undefined }}
                  onChange={(event) => handleFieldChange("province", event.target.value)}
                >
                  {provinces.map((province) => (
                    <option key={province}>{province}</option>
                  ))}
                </select>
                {errors.province?.message && (
                  <span id="province-error" className="form-field-error-msg" role="alert">
                    <AlertCircle size={13} /> {errors.province.message}
                  </span>
                )}
              </label>
              <label htmlFor="district">
                District / City *
                <input
                  id="district"
                  name="district"
                  value={values.district || ""}
                  aria-invalid={Boolean(errors.district)}
                  aria-describedby={errors.district ? "district-error" : undefined}
                  style={{ borderColor: errors.district ? "#ef4444" : undefined }}
                  onChange={(event) => handleFieldChange("district", event.target.value)}
                  placeholder="Kathmandu"
                />
                {errors.district?.message && (
                  <span id="district-error" className="form-field-error-msg" role="alert">
                    <AlertCircle size={13} /> {errors.district.message}
                  </span>
                )}
              </label>
              <label htmlFor="area">
                Area *
                <input
                  id="area"
                  name="area"
                  value={values.area || ""}
                  aria-invalid={Boolean(errors.area)}
                  aria-describedby={errors.area ? "area-error" : undefined}
                  style={{ borderColor: errors.area ? "#ef4444" : undefined }}
                  onChange={(event) => handleFieldChange("area", event.target.value)}
                  placeholder="Budhanilkantha Area"
                />
                {errors.area?.message && (
                  <span id="area-error" className="form-field-error-msg" role="alert">
                    <AlertCircle size={13} /> {errors.area.message}
                  </span>
                )}
              </label>
              <label htmlFor="street">
                Street Address *
                <input
                  id="street"
                  name="street"
                  value={values.street || ""}
                  aria-invalid={Boolean(errors.street)}
                  aria-describedby={errors.street ? "street-error" : undefined}
                  style={{ borderColor: errors.street ? "#ef4444" : undefined }}
                  onChange={(event) => handleFieldChange("street", event.target.value)}
                  placeholder="Gairigaon Marg"
                />
                {errors.street?.message && (
                  <span id="street-error" className="form-field-error-msg" role="alert">
                    <AlertCircle size={13} /> {errors.street.message}
                  </span>
                )}
              </label>
              <label htmlFor="landmark">
                Landmark (Optional)
                <input
                  id="landmark"
                  name="landmark"
                  value={values.landmark || ""}
                  onChange={(event) => handleFieldChange("landmark", event.target.value)}
                  placeholder="Near Ganesh Mandir"
                />
              </label>
              <label htmlFor="postalCode">
                Postal Code
                <input
                  id="postalCode"
                  name="postalCode"
                  value={values.postalCode || ""}
                  onChange={(event) => handleFieldChange("postalCode", event.target.value)}
                  placeholder="44600"
                />
              </label>
            </form>

            <p className="co-type-label">Address Type</p>
            <div className="co-type-row">
              {addressTypes.map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`co-type-chip ${values.addressType === type ? "active" : ""}`}
                  onClick={() => handleFieldChange("addressType", type)}
                >
                  {type === "Home"
                    ? "Home Address"
                    : type === "Work"
                      ? "Work Address"
                      : "Other Address"}
                </button>
              ))}
            </div>
          </section>
        </div>

        <OrderSummaryCard
          items={items}
          actionLabel="Continue to Payment"
          onAction={continueToPayment}
        />
      </div>
    </CheckoutShell>
  );
}

export default CheckoutDelivery;
