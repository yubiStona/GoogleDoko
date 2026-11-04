import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AccountModal from "../../components/account/AccountModal";
import AccountShell from "../../components/account/AccountShell";
import { useAccount } from "../../context/AccountContext";
import type { MockAddress } from "../../data/mockAddresses";
import { getFormErrorScrollHandler } from "../../utils/formErrorNavigation";

const addressSchema = yup.object({
  label: yup.string().required("Label is required").trim(),
  fullName: yup.string().required("Full name is required").trim(),
  phone: yup.string().required("Phone is required").trim(),
  province: yup.string().required("Province is required").trim(),
  city: yup.string().required("City is required").trim(),
  area: yup.string().required("Area is required").trim(),
  street: yup.string().required("Street is required").trim(),
  postalCode: yup.string().default("").trim(),
  isDefault: yup.boolean().default(false),
});

type AddressFormData = yup.InferType<typeof addressSchema>;

const emptyAddress: AddressFormData = {
  label: "Home",
  fullName: "",
  phone: "",
  province: "",
  city: "",
  area: "",
  street: "",
  postalCode: "",
  isDefault: false,
};

function AccountAddresses() {
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAccount();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: emptyAddress,
  });

  function openAdd() {
    setEditingId(null);
    reset(emptyAddress);
    setOpen(true);
  }

  function openEdit(address: MockAddress) {
    const { id, ...rest } = address;
    setEditingId(id);
    reset({
      label: rest.label,
      fullName: rest.fullName,
      phone: rest.phone,
      province: rest.province,
      city: rest.city,
      area: rest.area,
      street: rest.street,
      postalCode: rest.postalCode,
      isDefault: Boolean(rest.isDefault),
    });
    setOpen(true);
  }

  function onSave(data: AddressFormData) {
    const payload = {
      label: data.label,
      fullName: data.fullName,
      phone: data.phone,
      province: data.province,
      city: data.city,
      area: data.area,
      street: data.street,
      postalCode: data.postalCode || "",
      isDefault: Boolean(data.isDefault),
    };
    if (editingId) {
      updateAddress(editingId, payload);
    } else {
      addAddress(payload);
    }
    setOpen(false);
  }

  return (
    <AccountShell title="Addresses">
      <div className="account-form-actions">
        <button type="button" className="account-btn" onClick={openAdd}>
          Add Address
        </button>
      </div>

      <div className="account-address-list">
        {addresses.map((address) => (
          <article key={address.id} className="account-address-card">
            <div>
              <h3>
                {address.label}
                {address.isDefault ? <em>Default</em> : null}
              </h3>
              <p>{address.fullName}</p>
              <p>{address.phone}</p>
              <p>
                {address.street}, {address.area}, {address.city}, {address.province}{" "}
                {address.postalCode}
              </p>
            </div>
            <div className="account-form-actions">
              {!address.isDefault ? (
                <button
                  type="button"
                  className="account-btn ghost"
                  onClick={() => setDefaultAddress(address.id)}
                >
                  Set as Default
                </button>
              ) : null}
              <button type="button" className="account-btn ghost" onClick={() => openEdit(address)}>
                Edit
              </button>
              <button
                type="button"
                className="account-btn ghost danger"
                onClick={() => {
                  if (window.confirm("Delete this address?")) {
                    deleteAddress(address.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <AccountModal
        open={open}
        title={editingId ? "Edit Address" : "Add Address"}
        onClose={() => setOpen(false)}
      >
        <form className="account-form" onSubmit={handleSubmit(onSave, getFormErrorScrollHandler())} noValidate>
          {(
            [
              ["label", "Label"],
              ["fullName", "Full Name"],
              ["phone", "Phone"],
              ["province", "Province"],
              ["city", "City"],
              ["area", "Area"],
              ["street", "Street Address"],
              ["postalCode", "Postal Code"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input {...register(key)} style={{ borderColor: errors[key] ? "#ef4444" : undefined }} />
              {errors[key]?.message && (
                <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                  {errors[key]?.message}
                </span>
              )}
            </label>
          ))}
          <label className="account-check">
            <input
              type="checkbox"
              {...register("isDefault")}
            />
            Set as default
          </label>
          <div className="account-form-actions">
            <button type="submit" className="account-btn">
              Save
            </button>
            <button type="button" className="account-btn ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </AccountModal>
    </AccountShell>
  );
}

export default AccountAddresses;
