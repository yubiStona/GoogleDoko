const TOKEN_KEY = "googledoko-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string, remember: boolean) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  if (!token) {
    return;
  }
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "";

export class ApiError extends Error {
  status?: number;
  data?: unknown;
  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!headers.has("Content-Type") && init.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  let response: Response;
  const targetUrl = path.startsWith("http") ? path : `${API_BASE}${path}`;
  try {
    response = await fetch(targetUrl, { ...init, headers });
  } catch {
    try {
      response = await fetch(path, { ...init, headers });
    } catch {
      throw new ApiError("Could not reach the GoogleDoko server. Make sure the API is running on port 4000.");
    }
  }
  const raw = (await response.json().catch(() => ({}))) as any;
  if (!response.ok) {
    const errorMsg =
      raw.error ||
      raw.message ||
      (raw.errors && Array.isArray(raw.errors) ? raw.errors.map((e: any) => e.msg || e.message).join(", ") : undefined) ||
      (raw.errors && typeof raw.errors === "object" ? JSON.stringify(raw.errors) : undefined) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, raw);
  }
  if (raw && typeof raw === "object") {
    const isOk = raw.ok ?? raw.success ?? true;
    if ("data" in raw && raw.data !== undefined) {
      if (typeof raw.data === "object" && raw.data !== null && !Array.isArray(raw.data)) {
        return { ok: isOk, ...raw, ...raw.data } as T;
      }
      return raw.data as T;
    }
    return { ok: isOk, ...raw } as T;
  }
  return raw as T;
}

export const api = {
  products: () => request<AdminProduct[]>("/api/products"),
  resetPassword: (payload: { email: string; token: string; password?: string; newPassword?: string } | { token: string; password: string; email?: string }) => {
    const email = "email" in payload && payload.email ? payload.email : "";
    const token = payload.token;
    const password = "password" in payload && payload.password ? payload.password : ("newPassword" in payload ? payload.newPassword : "");
    return request<{ ok: boolean; message?: string }>("/api/auth/reset", {
      method: "POST",
      body: JSON.stringify({ email, token, password, newPassword: password }),
    });
  },
  subscribe: (email: string) => request('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),
  support: (body: Record<string, string>) => request<{ id: number }>('/api/support', { method: 'POST', body: JSON.stringify(body) }),
  adminSupport: () => request<SupportMessage[]>('/api/admin/support'),
  adminSupportStatus: (id: number, status: string) => request(`/api/admin/support/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminSubscribers: () => request<{ email: string; created_at: string }[]>('/api/admin/subscribers'),
  adminProductUpdate: (id: string, body: Partial<AdminProduct>) => request(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  vendorProducts: () => request<AdminProduct[]>('/api/vendor/products'),
  vendorSaveProduct: (id: string | null, body: Partial<AdminProduct>) => request(id ? `/api/vendor/products/${id}` : '/api/vendor/products', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) }),
  vendorRemoveProduct: (id: string) => request(`/api/vendor/products/${id}`, { method: 'DELETE' }),
  health: () => request<{ ok: boolean }>("/api/health"),
  login: (body: { identifier: string; password: string; expectedRole?: string }) =>
    request<SessionPayload>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  registerCustomer: (body: unknown) =>
    request<{ ok: boolean }>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  registerVendor: (body: unknown) =>
    request<{ ok: boolean }>("/api/auth/register-vendor", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  registerAdmin: (body: { fullName: string; email: string; password: string; securityKey: string }) =>
    request<SessionPayload>("/api/auth/register-admin", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  forgotPassword: (email: string) =>
    request<{ ok: boolean; resetToken?: string; message?: string; delivery?: string }>("/api/auth/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  me: () => request<SessionPayload>("/api/auth/me"),
  updateProfile: (body: unknown) =>
    request<SessionPayload>("/api/auth/profile", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (current: string, next: string) =>
    request<{ ok: boolean }>("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ current, next, currentPassword: current, newPassword: next }),
    }),
  saveShop: (body: unknown) =>
    request<SessionPayload>("/api/me/shop", { method: "PUT", body: JSON.stringify(body) }),
  createOrder: (body: unknown) =>
    request<{ id: string; orders: unknown[] }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getUserOrders: () => request<any[]>("/api/orders"),
  getOrderById: (id: string) => request<any>(`/api/orders/${id}`),
  adminOverview: () => request<AdminOverview>("/api/admin/overview"),
  adminUsers: () => request<AdminUser[]>("/api/admin/users"),
  adminVendors: () => request<AdminVendor[]>("/api/admin/vendors"),
  adminVendorStatus: (userId: number, status: "approved" | "under_review" | "on_hold" | "rejected") =>
    request<{ ok: boolean }>(`/api/admin/vendors/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  adminCoupons: () => request<AdminCoupon[]>("/api/admin/coupons"),
  adminCreateCoupon: (body: Partial<AdminCoupon>) =>
    request<{ ok: boolean; id: number }>("/api/admin/coupons", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  adminToggleCoupon: (id: number, active: number) =>
    request<{ ok: boolean }>(`/api/admin/coupons/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    }),
  adminDeleteCoupon: (id: number) =>
    request<{ ok: boolean }>(`/api/admin/coupons/${id}`, { method: "DELETE" }),
  adminSettings: () => request<PlatformSettings>("/api/admin/settings"),
  adminUpdateSettings: (body: Partial<PlatformSettings>) =>
    request<{ ok: boolean; settings: PlatformSettings }>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  adminOrders: () => request<AdminOrder[]>("/api/admin/orders"),
  adminOrderStatus: (id: string, status: string) =>
    request<{ ok: boolean }>(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  adminProducts: () => request<AdminProduct[]>("/api/admin/products"),
  adminSaveProduct: (id: string | null, body: Partial<AdminProduct>) =>
    request<{ id: string }>(id ? `/api/admin/products/${id}` : '/api/admin/products', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    }),
  adminRemoveProduct: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/products/${id}`, { method: 'DELETE' }),

  // Search
  search: (q: string, category?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    return request<AdminProduct[]>(`/api/search?${params.toString()}`);
  },

  // Wishlist (DB-persisted)
  getWishlist: () => request<AdminProduct[]>("/api/wishlist"),
  addToWishlist: (productId: string) => request<{ ok: boolean }>(`/api/wishlist/${productId}`, { method: "POST" }),
  removeFromWishlist: (productId: string) => request<{ ok: boolean }>(`/api/wishlist/${productId}`, { method: "DELETE" }),

  // Product Reviews
  getProductReviews: (productId: string) => request<ProductReview[]>(`/api/products/${productId}/reviews`),
  submitReview: (body: { productId: string; rating: number; title: string; body: string }) =>
    request<ProductReview>("/api/reviews", { method: "POST", body: JSON.stringify(body) }),

  // Image Upload
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<{ ok: boolean; url: string }>("/api/upload", { method: "POST", body: form });
  },

  // Admin reviews
  adminReviews: () => request<AdminReview[]>("/api/admin/reviews"),
  adminDeleteReview: (id: number) => request<{ ok: boolean }>(`/api/admin/reviews/${id}`, { method: "DELETE" }),

  // Cart (DB-persisted)
  getCart: () => request<CartItem[]>("/api/cart"),
  addToCart: (productId: string, quantity = 1) =>
    request<CartItem[]>("/api/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (productId: string, quantity: number) =>
    request<CartItem[]>(`/api/cart/${productId}`, { method: "PUT", body: JSON.stringify({ quantity }) }),
  removeFromCart: (productId: string) => request<CartItem[]>(`/api/cart/${productId}`, { method: "DELETE" }),
  clearCart: () => request<CartItem[]>("/api/cart", { method: "DELETE" }),

  // Addresses (DB-persisted)
  getAddresses: () => request<UserAddress[]>("/api/addresses"),
  addAddress: (body: Omit<UserAddress, "id">) =>
    request<UserAddress[]>("/api/addresses", { method: "POST", body: JSON.stringify(body) }),
  updateAddress: (id: string, body: Partial<UserAddress>) =>
    request<UserAddress[]>(`/api/addresses/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  setDefaultAddress: (id: string) =>
    request<UserAddress[]>(`/api/addresses/${id}/default`, { method: "PATCH" }),
  deleteAddress: (id: string) => request<UserAddress[]>(`/api/addresses/${id}`, { method: "DELETE" }),

  // Rewards (DB-persisted)
  getRewards: () => request<{ points: number; log: RewardEntry[] }>("/api/rewards"),
  redeemPoints: (amount: number) =>
    request<{ points: number; log: RewardEntry[] }>("/api/rewards/redeem", { method: "POST", body: JSON.stringify({ amount }) }),

  // Profile photo upload
  uploadProfilePhoto: (file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return request<{ ok: boolean; photo: string }>("/api/auth/photo", { method: "POST", body: form });
  },

  // Settings, Coupons & Checkout Calculation
  getSettings: () => request<PlatformSettings>("/api/settings"),
  validateCoupon: (code: string, subtotal: number) =>
    request<CouponValidation>("/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    }),
  calculateCheckout: (items: { productId: string; quantity: number }[], couponCode?: string) =>
    request<CheckoutCalculation>("/api/checkout/calculate", {
      method: "POST",
      body: JSON.stringify({ items, couponCode }),
    }),

  // Categories & Products
  categories: () => request<ApiCategory[]>("/api/categories"),
  categoryBySlug: (slug: string) => request<ApiCategory>(`/api/categories/${encodeURIComponent(slug)}`),
  categoryProducts: (name: string) =>
    request<AdminProduct[]>(`/api/categories/${encodeURIComponent(name)}/products`),
  popularProducts: (limit = 8) => request<AdminProduct[]>(`/api/products/popular?limit=${limit}`),
  featuredProducts: (limit = 8) => request<AdminProduct[]>(`/api/products/featured?limit=${limit}`),
  latestProducts: (limit = 8) => request<AdminProduct[]>(`/api/products/latest?limit=${limit}`),

  // Offers
  offers: () => request<{ banners: ApiOfferBanner[]; activeCoupons: any[] }>("/api/offers"),

  // Places
  places: () => request<ApiPlace[]>("/api/places"),
  placeById: (id: string) =>
    request<{ place: ApiPlace; products: AdminProduct[] }>(`/api/places/${encodeURIComponent(id)}`),

  // Vendor Orders
  vendorOrders: () => request<AdminOrder[]>("/api/vendor/orders"),

  // Order Tracking
  trackOrder: (id: string) => request<ApiOrderTracking>(`/api/orders/${encodeURIComponent(id)}/track`),
};

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  image: string;
  theme: "orange" | "green" | "red" | "teal" | "yellow" | "blue" | "purple";
  icon: string;
}

export interface ApiOfferBanner {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  image: string;
  theme: "green" | "yellow" | "blue" | "orange";
  to: string;
  badge?: string;
  code?: string;
}

export interface ApiPlace {
  id: string;
  name: string;
  origin: string;
  district: string;
  productsCount: number;
  totalSold: number;
  image: string;
  description: string;
}

export interface ApiOrderTracking {
  orderId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  recipientName: string;
  deliveryAddress: string;
  recipientPhone: string;
  items: any[];
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  steps: Array<{ step: string; date: string; status: "complete" | "current" | "pending" }>;
}

export interface SessionUser {
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
  role: "customer" | "vendor" | "admin";
  vendor?: Record<string, unknown>;
}

export interface SessionPayload {
  token?: string;
  user: SessionUser;
  orders: unknown[];
  addresses: unknown[];
  reviews: unknown[];
  rewards: unknown[];
  points: number;
  notifications: unknown;
  language: string;
  wishlist: unknown[];
  cart: unknown[];
}

export interface AdminOverview {
  users: number;
  vendors: number;
  pendingVendors: number;
  products: number;
  orders: number;
  revenue: number;
}

export interface AdminUser {
  id: number;
  email: string;
  phone: string;
  role: string;
  first_name: string;
  last_name: string;
  location: string;
  created_at: string;
  verified: number;
}

export interface AdminVendor {
  user_id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  business_name: string;
  vendor_type: string;
  location: string;
  district: string;
  category: string;
  status: string;
  created_at: string;
  address?: string;
  main_products?: string;
  description?: string;
  photo?: string;
  document_name?: string;
  product_count?: number;
}

export interface AdminCoupon {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order: number;
  expiry_date: string;
  times_used: number;
  active: number;
  created_at: string;
}

export interface PlatformSettings {
  delivery_fee: number;
  free_delivery_threshold: number;
  platform_commission: number;
  support_phone: string;
  support_email: string;
  announcement_banner: string;
  announcement_active: boolean;
}

export interface AdminOrder {
  delivery_address: string;
  recipient_name: string;
  recipient_phone: string;
  items: { name: string; quantity: number; price: number }[];
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  date: string;
  status: string;
  total: number;
  payment_method: string;
  payment_status: string;
}

export interface SupportMessage { id: number; full_name: string; email: string; phone: string; address: string; inquiry: string; status: string; created_at: string; }

export interface AdminProduct {
  active: number;
  weight: string;
  image: string;
  description: string;
  rating: number;
  sold: string;
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  origin: string;
  seller: string;
}

export interface ProductReview {
  id: number;
  product_id: string;
  user_id: number;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  first_name: string;
  last_name: string;
  photo: string;
}

export interface AdminReview {
  id: number;
  product_id: string;
  user_id: number;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  product_name: string;
  product_image?: string;
}

export interface CartItem {
  id: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
  origin?: string;
  seller?: string;
}

export interface UserAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  street: string;
  postalCode: string;
  isDefault: boolean;
}

export interface RewardEntry {
  id: string;
  label: string;
  points: number;
  date: string;
}

export interface PlatformSettings {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  supportPhone: string;
  supportEmail: string;
  announcement: string;
  marketplaceStatus: string;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
  minOrder: number;
  message?: string;
  error?: string;
}

export interface CheckoutCalculationItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  weight: string;
  image: string;
  seller?: string;
  origin?: string;
  lineTotal: number;
  inStock: boolean;
  availableStock: number;
  error?: string;
}

export interface CheckoutCalculation {
  valid: boolean;
  items: CheckoutCalculationItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  coupon: {
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  } | null;
  freeDeliveryThreshold?: number;
  message?: string;
}

