import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  id: string;
  name: string;
  category: string;
  weight: string;
  price: number;
  rating: number;
  sold: string;
  origin: string;
  seller: string;
  image: string;
  stock?: number;
  active?: number;
  description?: string;
}

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
  vendor?: any;
  shop?: any;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  items: any[];
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order: number;
  max_uses: number;
  times_used: number;
  expiry_date?: string | null;
  active: number;
  created_at: string;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: async (args, api, extraOptions) => {
    const rawBaseQuery = fetchBaseQuery({
      baseUrl:
        import.meta.env.MODE === "test"
          ? "http://localhost:4000/api"
          : "/api",
      prepareHeaders: (headers) => {
        const token =
          localStorage.getItem("googledoko-token") ||
          sessionStorage.getItem("googledoko-token") ||
          localStorage.getItem("gd_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
      },
    });

    const result = await rawBaseQuery(args, api, extraOptions);
    if (result.data && typeof result.data === "object" && "data" in (result.data as any) && (result.data as any).data !== undefined) {
      return { ...result, data: (result.data as any).data };
    }
    return result;
  },
  tagTypes: [
    "User",
    "Products",
    "Orders",
    "AdminOverview",
    "AdminVendors",
    "AdminCoupons",
    "AdminSettings",
    "AdminOrders",
    "AdminSupport",
  ],
  endpoints: (builder) => ({
    // Products
    getProducts: builder.query<Product[], void>({
      query: () => "/products",
      providesTags: ["Products"],
    }),
    getPopularProducts: builder.query<Product[], number | void>({
      query: (limit = 8) => `/products/popular?limit=${limit}`,
      providesTags: ["Products"],
    }),
    getFeaturedProducts: builder.query<Product[], number | void>({
      query: (limit = 8) => `/products/featured?limit=${limit}`,
      providesTags: ["Products"],
    }),
    getLatestProducts: builder.query<Product[], number | void>({
      query: (limit = 8) => `/products/latest?limit=${limit}`,
      providesTags: ["Products"],
    }),
    getCategories: builder.query<any[], void>({
      query: () => "/categories",
      providesTags: ["Products"],
    }),
    getPlaces: builder.query<any[], void>({
      query: () => "/places",
      providesTags: ["Products"],
    }),
    getPlaceBySlug: builder.query<any, string>({
      query: (slug) => `/places/${slug}`,
      providesTags: ["Products"],
    }),
    getPlaceCategories: builder.query<any[], string>({
      query: (slug) => `/places/${slug}/categories`,
      providesTags: ["Products"],
    }),
    getPlaceProducts: builder.query<any, { slug: string; [key: string]: any }>({
      query: ({ slug, ...params }) => ({
        url: `/places/${slug}/products`,
        params,
      }),
      providesTags: ["Products"],
    }),
    getPlacePopularProducts: builder.query<any[], { slug: string; limit?: number }>({
      query: ({ slug, limit = 4 }) => `/places/${slug}/popular-products?limit=${limit}`,
      providesTags: ["Products"],
    }),
    getLifestyles: builder.query<any[], void>({
      query: () => "/lifestyles",
      providesTags: ["Products"],
    }),
    getLifestyleBySlug: builder.query<any, string>({
      query: (slug) => `/lifestyles/${slug}`,
      providesTags: ["Products"],
    }),
    getLifestyleProducts: builder.query<any, { slug: string; [key: string]: any }>({
      query: ({ slug, ...params }) => ({
        url: `/lifestyles/${slug}/products`,
        params,
      }),
      providesTags: ["Products"],
    }),
    getOffers: builder.query<any, void>({
      query: () => "/offers",
    }),
    getProductReviews: builder.query<any, { productId: string; [key: string]: any }>({
      query: ({ productId, ...params }) => ({
        url: `/products/${productId}/reviews`,
        params,
      }),
      providesTags: ["Products"],
    }),
    getMyReviews: builder.query<any[], void>({
      query: () => "/reviews/my-reviews",
      providesTags: ["Products"],
    }),
    submitReview: builder.mutation<any, any>({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products"],
    }),
    voteHelpful: builder.mutation<any, number>({
      query: (id) => ({
        url: `/reviews/${id}/helpful`,
        method: "POST",
      }),
      invalidatesTags: ["Products"],
    }),
    getVendorOrders: builder.query<Order[], void>({
      query: () => "/vendor/orders",
      providesTags: ["Orders"],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Products", id }],
    }),

    // Auth
    getMe: builder.query<any, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    login: builder.mutation<any, { identifier: string; password: string; expectedRole?: string }>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Orders"],
    }),
    registerCustomer: builder.mutation<any, any>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    registerVendor: builder.mutation<any, any>({
      query: (data) => ({
        url: "/auth/register-vendor",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User", "AdminVendors"],
    }),
    updateProfile: builder.mutation<any, any>({
      query: (data) => ({
        url: "/auth/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation<any, { current: string; next: string }>({
      query: (passwords) => ({
        url: "/auth/password",
        method: "PUT",
        body: passwords,
      }),
    }),
    forgotPassword: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: "/auth/forgot",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<any, { token: string; password: string }>({
      query: (body) => ({
        url: "/auth/reset",
        method: "POST",
        body,
      }),
    }),

    // Shop synchronization
    syncShop: builder.mutation<any, any>({
      query: (shop) => ({
        url: "/me/shop",
        method: "PUT",
        body: shop,
      }),
      invalidatesTags: ["User"],
    }),

    // Orders
    getOrders: builder.query<Order[], void>({
      query: () => "/orders",
      providesTags: ["Orders"],
    }),
    createOrder: builder.mutation<any, any>({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Orders", "Products", "AdminOverview", "AdminOrders"],
    }),

    // Public / general
    subscribeNewsletter: builder.mutation<{ ok: boolean }, { email: string }>({
      query: (body) => ({
        url: "/newsletter",
        method: "POST",
        body,
      }),
    }),
    sendSupportMessage: builder.mutation<{ id: number }, any>({
      query: (body) => ({
        url: "/support",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminSupport"],
    }),

    // Admin endpoints
    getAdminOverview: builder.query<any, void>({
      query: () => "/admin/overview",
      providesTags: ["AdminOverview"],
    }),
    getAdminVendors: builder.query<any[], void>({
      query: () => "/admin/vendors",
      providesTags: ["AdminVendors"],
    }),
    updateVendorStatus: builder.mutation<any, { userId: number | string; status: string }>({
      query: ({ userId, status }) => ({
        url: `/admin/vendors/${userId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminVendors", "AdminOverview"],
    }),
    getAdminCoupons: builder.query<Coupon[], void>({
      query: () => "/admin/coupons",
      providesTags: ["AdminCoupons"],
    }),
    createCoupon: builder.mutation<any, Partial<Coupon>>({
      query: (coupon) => ({
        url: "/admin/coupons",
        method: "POST",
        body: coupon,
      }),
      invalidatesTags: ["AdminCoupons"],
    }),
    toggleCoupon: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: `/admin/coupons/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminCoupons"],
    }),
    deleteCoupon: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: `/admin/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminCoupons"],
    }),
    getAdminSettings: builder.query<Record<string, string>, void>({
      query: () => "/admin/settings",
      providesTags: ["AdminSettings"],
    }),
    updateAdminSettings: builder.mutation<any, Record<string, string>>({
      query: (settings) => ({
        url: "/admin/settings",
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: ["AdminSettings"],
    }),
    getAdminOrders: builder.query<any[], void>({
      query: () => "/admin/orders",
      providesTags: ["AdminOrders"],
    }),
    updateOrderStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminOrders", "AdminOverview", "Orders"],
    }),
    getAdminSupport: builder.query<any[], void>({
      query: () => "/admin/support",
      providesTags: ["AdminSupport"],
    }),
    updateSupportStatus: builder.mutation<any, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/support/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminSupport"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetPopularProductsQuery,
  useGetFeaturedProductsQuery,
  useGetLatestProductsQuery,
  useGetCategoriesQuery,
  useGetPlacesQuery,
  useGetPlaceBySlugQuery,
  useGetPlaceCategoriesQuery,
  useGetPlaceProductsQuery,
  useGetPlacePopularProductsQuery,
  useGetLifestylesQuery,
  useGetLifestyleBySlugQuery,
  useGetLifestyleProductsQuery,
  useGetOffersQuery,
  useGetProductReviewsQuery,
  useGetMyReviewsQuery,
  useSubmitReviewMutation,
  useVoteHelpfulMutation,
  useGetVendorOrdersQuery,
  useGetProductByIdQuery,
  useGetMeQuery,
  useLoginMutation,
  useRegisterCustomerMutation,
  useRegisterVendorMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSyncShopMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useSubscribeNewsletterMutation,
  useSendSupportMessageMutation,
  useGetAdminOverviewQuery,
  useGetAdminVendorsQuery,
  useUpdateVendorStatusMutation,
  useGetAdminCouponsQuery,
  useCreateCouponMutation,
  useToggleCouponMutation,
  useDeleteCouponMutation,
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetAdminSupportQuery,
  useUpdateSupportStatusMutation,
} = apiSlice;
