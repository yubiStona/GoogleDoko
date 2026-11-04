import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type { Order } from "./utils";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
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
    getVendorOrders: builder.query<Order[], void>({
      query: () => "/vendor/orders",
      providesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetVendorOrdersQuery,
} = orderApi;

export * from "./utils";
