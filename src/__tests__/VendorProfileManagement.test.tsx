import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { VendorProfile } from "../pages/vendor/VendorPages";
import * as AccountContextModule from "../context/AccountContext";
import { api } from "../api/client";

describe("Vendor Profile Management & Store Branding UI Tests", () => {
  const mockUpdateUser = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AccountContextModule, "useAccount").mockReturnValue({
      isLoggedIn: true,
      user: {
        id: 10,
        firstName: "Ram",
        lastName: "Sharma",
        email: "ram@farm.com",
        phone: "9800000000",
        photo: "/uploads/ram-avatar.jpg",
        role: "vendor",
        vendor: {
          businessName: "Ram Organic Farm",
          description: "Freshly harvested organic produce.",
          status: "approved",
          photo: "/uploads/store-logo.png",
          banner: "/uploads/store-banner.jpg",
          hours: "7:00 AM - 6:00 PM",
          sundayHours: "Closed",
          storeEmail: "contact@ramfarm.com",
          storePhone: "01-4455667",
        },
      },
      showToast: mockShowToast,
      updateUser: mockUpdateUser,
    } as any);

    // Mock API client
    vi.spyOn(api, "vendorProfile").mockResolvedValue({
      userId: 10,
      businessName: "Ram Organic Farm",
      vendorType: "Local Farm",
      location: "Kathmandu",
      district: "Kathmandu",
      address: "Kalimati, Ward 4",
      category: "Organic Fruits & Vegetables",
      description: "Freshly harvested organic produce.",
      profileImage: "/uploads/ram-avatar.jpg",
      storeLogo: "/uploads/store-logo.png",
      storeBanner: "/uploads/store-banner.jpg",
      storeEmail: "contact@ramfarm.com",
      storePhone: "01-4455667",
      storeHours: "7:00 AM - 6:00 PM",
      storeSocials: {
        website: "https://ramfarm.com",
        facebook: "https://facebook.com/ramfarm",
        instagram: "https://instagram.com/ramfarm",
      },
      status: "approved",
      contact: {
        firstName: "Ram",
        lastName: "Sharma",
        email: "ram@farm.com",
        phone: "9800000000",
      },
    });

    vi.spyOn(api, "vendorUploadAvatar").mockResolvedValue({
      userId: 10,
      businessName: "Ram Organic Farm",
      vendorType: "Local Farm",
      location: "Kathmandu",
      district: "Kathmandu",
      address: "Kalimati",
      category: "Vegetables",
      status: "approved",
      profileImage: "/uploads/new-ram.jpg",
      contact: { firstName: "Ram", lastName: "Sharma", email: "ram@farm.com", phone: "9800000000" },
    });

    vi.spyOn(api, "vendorDeleteAvatar").mockResolvedValue({
      userId: 10,
      businessName: "Ram Organic Farm",
      vendorType: "Local Farm",
      location: "Kathmandu",
      district: "Kathmandu",
      address: "Kalimati",
      category: "Vegetables",
      status: "approved",
      profileImage: "",
      contact: { firstName: "Ram", lastName: "Sharma", email: "ram@farm.com", phone: "9800000000" },
    });

    vi.spyOn(api, "vendorUploadStoreLogo").mockResolvedValue({
      userId: 10,
      businessName: "Ram Organic Farm",
      vendorType: "Local Farm",
      location: "Kathmandu",
      district: "Kathmandu",
      address: "Kalimati",
      category: "Vegetables",
      status: "approved",
      storeLogo: "/uploads/new-logo.png",
      contact: { firstName: "Ram", lastName: "Sharma", email: "ram@farm.com", phone: "9800000000" },
    });

    vi.spyOn(api, "vendorDeleteStoreLogo").mockResolvedValue({
      userId: 10,
      businessName: "Ram Organic Farm",
      vendorType: "Local Farm",
      location: "Kathmandu",
      district: "Kathmandu",
      address: "Kalimati",
      category: "Vegetables",
      status: "approved",
      storeLogo: "",
      contact: { firstName: "Ram", lastName: "Sharma", email: "ram@farm.com", phone: "9800000000" },
    });

    vi.spyOn(api, "vendorUploadStoreBanner").mockResolvedValue({
      userId: 10,
      businessName: "Ram Organic Farm",
      vendorType: "Local Farm",
      location: "Kathmandu",
      district: "Kathmandu",
      address: "Kalimati",
      category: "Vegetables",
      status: "approved",
      storeBanner: "/uploads/new-banner.jpg",
      contact: { firstName: "Ram", lastName: "Sharma", email: "ram@farm.com", phone: "9800000000" },
    });

    vi.spyOn(api, "vendorDeleteStoreBanner").mockResolvedValue({
      userId: 10,
      businessName: "Ram Organic Farm",
      vendorType: "Local Farm",
      location: "Kathmandu",
      district: "Kathmandu",
      address: "Kalimati",
      category: "Vegetables",
      status: "approved",
      storeBanner: "",
      contact: { firstName: "Ram", lastName: "Sharma", email: "ram@farm.com", phone: "9800000000" },
    });

    vi.spyOn(api, "vendorUpdateProfile").mockResolvedValue({
      userId: 10,
      businessName: "Ram Organic Farm",
      vendorType: "Local Farm",
      location: "Kathmandu",
      district: "Kathmandu",
      address: "Kalimati",
      category: "Vegetables",
      status: "approved",
      contact: { firstName: "Ram", lastName: "Sharma", email: "ram@farm.com", phone: "9800000000" },
    });

    vi.spyOn(api, "vendorChangePassword").mockResolvedValue({
      ok: true,
      message: "Password changed successfully.",
    });

    // Mock URL.createObjectURL
    globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-image-preview-url");
  });

  it("renders all 5 core profile sections including personal info, store branding, and account security", async () => {
    render(
      <MemoryRouter>
        <VendorProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Header & Overview
      expect(screen.getByText("Vendor Profile & Store Branding")).toBeInTheDocument();
      expect(screen.getByText("Verified Vendor")).toBeInTheDocument();

      // Section Headings
      expect(screen.getByText("Personal Account Information")).toBeInTheDocument();
      expect(screen.getByText("Store Branding & Logo")).toBeInTheDocument();
      expect(screen.getByText("Storefront Public Details")).toBeInTheDocument();
      expect(screen.getByText("Account Security & Password")).toBeInTheDocument();
      expect(screen.getByText("Market Categorization")).toBeInTheDocument();
    });
  });

  it("allows uploading a new personal profile avatar and syncs to account state", async () => {
    render(
      <MemoryRouter>
        <VendorProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Verified Vendor")).toBeInTheDocument();
    });

    const file = new File(["dummy content"], "avatar.png", { type: "image/png" });
    const avatarInput = screen.getByLabelText("Upload personal profile picture");

    fireEvent.change(avatarInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(api.vendorUploadAvatar).toHaveBeenCalledWith(file);
      expect(mockUpdateUser).toHaveBeenCalledWith({ photo: "/uploads/new-ram.jpg" });
      expect(mockShowToast).toHaveBeenCalledWith("Profile picture updated successfully");
    });
  });

  it("allows removing personal profile picture", async () => {
    render(
      <MemoryRouter>
        <VendorProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Remove Photo")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Remove Photo"));

    await waitFor(() => {
      expect(api.vendorDeleteAvatar).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith({ photo: "" });
      expect(mockShowToast).toHaveBeenCalledWith("Profile picture removed");
    });
  });

  it("allows uploading and removing store logo independently", async () => {
    render(
      <MemoryRouter>
        <VendorProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Upload store logo")).toBeInTheDocument();
    });

    const file = new File(["dummy content"], "logo.png", { type: "image/png" });
    const logoInput = screen.getByLabelText("Upload store logo");

    fireEvent.change(logoInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(api.vendorUploadStoreLogo).toHaveBeenCalledWith(file);
      expect(mockUpdateUser).toHaveBeenCalledWith({ vendor: { photo: "/uploads/new-logo.png" } });
      expect(mockShowToast).toHaveBeenCalledWith("Store logo updated successfully");
    });

    // Remove logo
    fireEvent.click(screen.getByText("Remove Logo"));

    await waitFor(() => {
      expect(api.vendorDeleteStoreLogo).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith({ vendor: { photo: "" } });
      expect(mockShowToast).toHaveBeenCalledWith("Store logo removed");
    });
  });

  it("allows resetting/removing store banner cleanly", async () => {
    render(
      <MemoryRouter>
        <VendorProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Reset Banner")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Reset Banner"));

    await waitFor(() => {
      expect(api.vendorDeleteStoreBanner).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith({ vendor: { banner: "" } });
      expect(mockShowToast).toHaveBeenCalledWith("Store banner removed");
      expect(screen.getByText("No Cover Banner Set")).toBeInTheDocument();
    });
  });

  it("validates and submits password change securely with current password verification", async () => {
    render(
      <MemoryRouter>
        <VendorProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter your current password")).toBeInTheDocument();
    });

    const currentPwInput = screen.getByPlaceholderText("Enter your current password");
    const newPwInput = screen.getByPlaceholderText("At least 6 characters");
    const confirmPwInput = screen.getByPlaceholderText("Repeat new password");
    const updatePwBtn = screen.getByText("Update Password");

    // Enter matching valid passwords
    fireEvent.change(currentPwInput, { target: { value: "OldPassword123" } });
    fireEvent.change(newPwInput, { target: { value: "NewSecurePassword456" } });
    fireEvent.change(confirmPwInput, { target: { value: "NewSecurePassword456" } });

    fireEvent.click(updatePwBtn);

    await waitFor(() => {
      expect(api.vendorChangePassword).toHaveBeenCalledWith({
        currentPassword: "OldPassword123",
        newPassword: "NewSecurePassword456",
        confirmPassword: "NewSecurePassword456",
      });
      expect(mockShowToast).toHaveBeenCalledWith("Password updated successfully");
      expect(screen.getByText("Your password has been changed successfully.")).toBeInTheDocument();
    });
  });

  it("opens public storefront preview modal with branding and contact details", async () => {
    render(
      <MemoryRouter>
        <VendorProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Preview Public Store")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Preview Public Store"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Operating Hours:")).toBeInTheDocument();
      expect(screen.getByText(/contact@ramfarm\.com/)).toBeInTheDocument();
    });
  });
});
