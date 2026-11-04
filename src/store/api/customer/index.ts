import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type { User } from "../auth/utils";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery,
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    getCustomerProfile: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["Customer"],
    }),
  }),
});

export const { useGetCustomerProfileQuery } = customerApi;
