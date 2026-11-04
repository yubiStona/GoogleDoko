import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type {
  AuthResponse,
  CustomerRegisterPayload,
  User,
  VendorRegisterPayload,
} from "./utils";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
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
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterCustomerMutation,
  useRegisterVendorMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSyncShopMutation,
} = authApi;

export * from "./utils";
