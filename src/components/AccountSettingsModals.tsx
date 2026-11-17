import { useState, type FormEvent } from "react";
import * as yup from "yup";

import AccountModal from "./account/AccountModal";
import { useAccount } from "../context/AccountContext";

/**
 * Yup schema for customer password modification
 */
const changePasswordSchema = yup.object().shape({
  current: yup.string().trim().required("Current password is required"),
  next: yup
    .string()
    .required("New password is required")
    .min(8, "New password must be at least 8 characters"),
  confirm: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("next")], "Passwords do not match"),
});

interface AccountSettingsModalsProps {
  passwordOpen: boolean;
  notificationsOpen: boolean;
  languageOpen: boolean;
  inviteOpen: boolean;
  onClose: () => void;
}

function AccountSettingsModals({
  passwordOpen,
  notificationsOpen,
  languageOpen,
  inviteOpen,
  onClose,
}: AccountSettingsModalsProps) {
  const {
    user,
    notifications,
    language,
    changePassword,
    saveNotifications,
    setLanguage,
    showToast,
  } = useAccount();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});
  const [generalError, setGeneralError] = useState("");

  async function submitPassword(event: FormEvent) {
    event.preventDefault();

    try {
      await changePasswordSchema.validate(
        { current, next, confirm },
        { abortEarly: false },
      );
      setFieldErrors({});
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        const errs: { current?: string; next?: string; confirm?: string } = {};
        err.inner.forEach((item) => {
          if (item.path && !errs[item.path as keyof typeof errs]) {
            errs[item.path as keyof typeof errs] = item.message;
          }
        });
        setFieldErrors(errs);
        return;
      }
    }

    setFieldErrors({});
    setGeneralError("");
    const result = await changePassword(current, next);
    if (result) {
      setGeneralError(result);
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setFieldErrors({});
    setGeneralError("");
    onClose();
  }

  async function copyCode() {
    await navigator.clipboard.writeText(user.referralCode);
    showToast("Referral code copied!");
  }

  return (
    <>
      <AccountModal
        open={passwordOpen}
        title="Change Password"
        onClose={onClose}
      >
        <form className="account-form" onSubmit={submitPassword} noValidate>
          <label>
            Current Password
            <input
              type="password"
              value={current}
              style={{
                borderColor: fieldErrors.current ? "#ef4444" : undefined,
              }}
              onChange={(event) => {
                setCurrent(event.target.value);
                setFieldErrors((prev) => ({ ...prev, current: undefined }));
              }}
            />
            {fieldErrors.current && (
              <span
                style={{ color: "#ef4444", fontSize: 11, display: "block" }}
              >
                {fieldErrors.current}
              </span>
            )}
          </label>
          <label>
            New Password
            <input
              type="password"
              value={next}
              style={{ borderColor: fieldErrors.next ? "#ef4444" : undefined }}
              onChange={(event) => {
                setNext(event.target.value);
                setFieldErrors((prev) => ({ ...prev, next: undefined }));
              }}
            />
            {fieldErrors.next && (
              <span
                style={{ color: "#ef4444", fontSize: 11, display: "block" }}
              >
                {fieldErrors.next}
              </span>
            )}
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              value={confirm}
              style={{
                borderColor: fieldErrors.confirm ? "#ef4444" : undefined,
              }}
              onChange={(event) => {
                setConfirm(event.target.value);
                setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
              }}
            />
            {fieldErrors.confirm && (
              <span
                style={{ color: "#ef4444", fontSize: 11, display: "block" }}
              >
                {fieldErrors.confirm}
              </span>
            )}
          </label>
          {generalError ? (
            <p className="account-form-error">{generalError}</p>
          ) : null}
          <p className="account-login-note">
            Passwords must be at least 8 characters.
          </p>
          <button type="submit" className="account-btn">
            Update Password
          </button>
        </form>
      </AccountModal>

      <AccountModal
        open={notificationsOpen}
        title="Notification Settings"
        onClose={onClose}
      >
        <div className="account-switch-list">
          {(
            [
              ["orderUpdates", "Order Updates"],
              ["deliveryUpdates", "Delivery Updates"],
              ["promotionalOffers", "Promotional Offers"],
              ["emailNotifications", "Email Notifications"],
              ["pushNotifications", "Push Notifications"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="account-switch">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={(event) => {
                  const nextValue = {
                    ...notifications,
                    [key]: event.target.checked,
                  };
                  saveNotifications(nextValue);
                  showToast("Notification settings saved");
                }}
              />
            </label>
          ))}
        </div>
      </AccountModal>

      <AccountModal open={languageOpen} title="Language" onClose={onClose}>
        <div className="account-form">
          {(["English", "Nepali"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={
                language === option ? "account-chip active" : "account-chip"
              }
              onClick={() => {
                setLanguage(option);
                showToast(`Language set to ${option}`);
                onClose();
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </AccountModal>

      <AccountModal open={inviteOpen} title="Invite Friends" onClose={onClose}>
        <p>Your Referral Code:</p>
        <p className="account-referral">{user.referralCode}</p>
        <div className="account-form-actions">
          <button type="button" className="account-btn" onClick={copyCode}>
            Copy Code
          </button>
          <button
            type="button"
            className="account-btn ghost"
            onClick={async () => {
              const shareText = `Join GoogleDoko with my code ${user.referralCode}`;
              if (navigator.share) {
                await navigator.share({ text: shareText });
              } else {
                await navigator.clipboard.writeText(shareText);
                showToast("Referral code copied!");
              }
            }}
          >
            Share
          </button>
        </div>
      </AccountModal>
    </>
  );
}

export default AccountSettingsModals;
