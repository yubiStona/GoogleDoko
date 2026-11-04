export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  verified: boolean;
  rewardPoints: number;
  referralCode: string;
  photo: string;
  role: "admin" | "vendor" | "customer";
  vendor?: Record<string, unknown>;
  shop?: Record<string, unknown>;
}

export interface AuthResponse {
  ok?: boolean;
  token?: string;
  user: User;
  message?: string;
}

export interface CustomerRegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
}

export interface VendorRegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  vendorType: string;
  location: string;
  district?: string;
  phone?: string;
}
