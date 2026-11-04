import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type {
  AdminOrder,
  AdminOverview,
  AdminVendor,
  Coupon,
  SupportMessage,
} from "./utils";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery,
  tagTypes: [
    "AdminOverview",
    "AdminVendors",
    "AdminCoupons",
    "AdminSettings",
    "AdminOrders",
    "AdminSupport",
  ],
  endpoints: (builder) => ({
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
    deleteCoupon: builder.mutation<
      { ok: boolean; id: number },
      { id: number }
    >({
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

export const dashboardApi = adminApi;

export const {
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
} = adminApi;

export * from "./utils";
