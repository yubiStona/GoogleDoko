import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type {
  Product,
  User,
  Order,
  Coupon,
  OffersResponse,
  AuthResponse,
  CustomerRegisterPayload,
  VendorRegisterPayload,
  ReviewSubmissionPayload,
  ReviewResponse,
  SupportMessagePayload,
  ApiCategory,
  ApiPlace,
  PlaceCategorySummary,
  PlaceProductsResponse,
  LifestyleCollection,
  LifestyleProductsResponse,
  AdminOverview,
  AdminVendor,
  AdminOrder,
  SupportMessage,
  ProductReviewsResponse,
  MyReviewItem,
} from "./types";

export * from "./types";
export * from "./utils";
export * from "./product";
export * from "./categories";
export * from "./brands";
export * from "./gallery";
export * from "./hero";
export * from "./reviews";
export * from "./orders";
export * from "./auth";
export * from "./dashboard";
export * from "./contactUs";
export * from "./aboutUs";
export * from "./customer";
export * from "./siteSettings";
export * from "./projects";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
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
    "Places",
    "Categories",
    "Lifestyle",
    "Offers",
    "Reviews",
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
    getCategories: builder.query<ApiCategory[], void>({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),
    getPlaces: builder.query<ApiPlace[], void>({
      query: () => "/places",
      providesTags: ["Places"],
    }),
    getPlaceBySlug: builder.query<ApiPlace, string>({
      query: (slug) => `/places/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: "Places", id: slug }],
    }),
    getPlaceCategories: builder.query<PlaceCategorySummary[], string>({
      query: (slug) => `/places/${slug}/categories`,
      providesTags: (_result, _error, slug) => [
        { type: "Places", id: `${slug}-categories` },
      ],
    }),
    getPlaceProducts: builder.query<
      PlaceProductsResponse,
      {
        slug: string;
        category?: string;
        sort?: string;
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: ({ slug, ...params }) => ({
        url: `/places/${slug}/products`,
        params,
      }),
      providesTags: (_result, _error, { slug }) => [
        { type: "Places", id: `${slug}-products` },
      ],
    }),
    getPlacePopularProducts: builder.query<
      Product[],
      { slug: string; limit?: number }
    >({
      query: ({ slug, limit = 4 }) => `/places/${slug}/popular?limit=${limit}`,
      providesTags: (_result, _error, { slug }) => [
        { type: "Places", id: `${slug}-popular` },
      ],
    }),
    getLifestyles: builder.query<LifestyleCollection[], void>({
      query: () => "/lifestyle",
      providesTags: ["Lifestyle"],
    }),
    getLifestyleBySlug: builder.query<LifestyleCollection, string>({
      query: (slug) => `/lifestyle/${slug}`,
      providesTags: (_result, _error, slug) => [
        { type: "Lifestyle", id: slug },
      ],
    }),
    getLifestyleProducts: builder.query<
      LifestyleProductsResponse,
      {
        slug: string;
        category?: string;
        sort?: string;
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: ({ slug, ...params }) => ({
        url: `/lifestyle/${slug}/products`,
        params,
      }),
      providesTags: (_result, _error, { slug }) => [
        { type: "Lifestyle", id: `${slug}-products` },
      ],
    }),
    getOffers: builder.query<OffersResponse, void>({
      query: () => "/offers",
      providesTags: ["Offers"],
    }),
    getProductReviews: builder.query<
      ProductReviewsResponse,
      { productId: string; page?: number; limit?: number; sort?: string }
    >({
      query: ({ productId, ...params }) => ({
        url: `/reviews/product/${productId}`,
        params,
      }),
      providesTags: (_result, _error, { productId }) => [
        { type: "Reviews", id: productId },
      ],
    }),
    getMyReviews: builder.query<MyReviewItem[], void>({
      query: () => "/reviews/my-reviews",
      providesTags: ["Reviews"],
    }),
    submitReview: builder.mutation<ReviewResponse, ReviewSubmissionPayload>({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reviews"],
    }),
    voteHelpful: builder.mutation<
      { ok: boolean; helpfulCount: number },
      { reviewId: number }
    >({
      query: ({ reviewId }) => ({
        url: `/reviews/${reviewId}/vote`,
        method: "POST",
      }),
      invalidatesTags: ["Reviews"],
    }),
    getVendorOrders: builder.query<Order[], void>({
      query: () => "/vendor/orders",
      providesTags: ["Orders"],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Products", id }],
    }),
    getMe: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    login: builder.mutation<
      AuthResponse,
      { email: string; password: string; role?: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    registerCustomer: builder.mutation<AuthResponse, CustomerRegisterPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    registerVendor: builder.mutation<AuthResponse, VendorRegisterPayload>({
      query: (body) => ({
        url: "/auth/register-vendor",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation<
      { ok: boolean; message: string },
      { currentPassword?: string; oldPassword?: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation<
      { ok: boolean; message: string; devResetUrl?: string },
      { email: string }
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      { ok: boolean; message: string },
      { token: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    syncShop: builder.mutation<
      { ok: boolean; message: string; shop?: Record<string, unknown> },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/auth/sync-shop",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getOrders: builder.query<Order[], void>({
      query: () => "/orders",
      providesTags: ["Orders"],
    }),
    createOrder: builder.mutation<Order, Partial<Order>>({
      query: (body) => ({
        url: "/checkout/order",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),
    subscribeNewsletter: builder.mutation<{ ok: boolean }, { email: string }>({
      query: (body) => ({
        url: "/support/newsletter",
        method: "POST",
        body,
      }),
    }),
    sendSupportMessage: builder.mutation<{ id: number }, SupportMessagePayload>(
      {
        query: (body) => ({
          url: "/support/message",
          method: "POST",
          body,
        }),
      },
    ),
    getAdminOverview: builder.query<AdminOverview, void>({
      query: () => "/admin/overview",
      providesTags: ["AdminOverview"],
    }),
    getAdminVendors: builder.query<AdminVendor[], void>({
      query: () => "/admin/vendors",
      providesTags: ["AdminVendors"],
    }),
    updateVendorStatus: builder.mutation<
      { ok: boolean },
      { vendorId: number; status: string; reason?: string }
    >({
      query: ({ vendorId, ...body }) => ({
        url: `/admin/vendors/${vendorId}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminVendors", "AdminOverview"],
    }),
    getAdminCoupons: builder.query<Coupon[], void>({
      query: () => "/admin/coupons",
      providesTags: ["AdminCoupons"],
    }),
    createCoupon: builder.mutation<Coupon, Partial<Coupon>>({
      query: (body) => ({
        url: "/admin/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminCoupons"],
    }),
    toggleCoupon: builder.mutation<Coupon, { id: number }>({
      query: ({ id }) => ({
        url: `/admin/coupons/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminCoupons"],
    }),
    deleteCoupon: builder.mutation<{ ok: boolean; id: number }, { id: number }>(
      {
        query: ({ id }) => ({
          url: `/admin/coupons/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["AdminCoupons"],
      },
    ),
    getAdminSettings: builder.query<Record<string, string>, void>({
      query: () => "/admin/settings",
      providesTags: ["AdminSettings"],
    }),
    updateAdminSettings: builder.mutation<
      { ok: boolean },
      Record<string, string>
    >({
      query: (body) => ({
        url: "/admin/settings",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminSettings"],
    }),
    getAdminOrders: builder.query<AdminOrder[], void>({
      query: () => "/admin/orders",
      providesTags: ["AdminOrders"],
    }),
    updateOrderStatus: builder.mutation<
      AdminOrder,
      { orderId: string; status: string; note?: string }
    >({
      query: ({ orderId, ...body }) => ({
        url: `/admin/orders/${orderId}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminOrders", "AdminOverview"],
    }),
    getAdminSupport: builder.query<SupportMessage[], void>({
      query: () => "/admin/support",
      providesTags: ["AdminSupport"],
    }),
    updateSupportStatus: builder.mutation<
      { ok: boolean },
      { messageId: number; status: string; notes?: string }
    >({
      query: ({ messageId, ...body }) => ({
        url: `/admin/support/${messageId}/status`,
        method: "PATCH",
        body,
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
