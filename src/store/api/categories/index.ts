import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type { ApiCategory } from "./utils";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery,
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    getCategories: builder.query<ApiCategory[], void>({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),
  }),
});

export const { useGetCategoriesQuery } = categoryApi;
export * from "./utils";
