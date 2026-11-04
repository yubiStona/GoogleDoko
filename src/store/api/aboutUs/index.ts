import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type { AboutUsApiResponse } from "./utils";

export const aboutUsApi = createApi({
  reducerPath: "aboutUsApi",
  baseQuery,
  endpoints: (builder) => ({
    getAboutUs: builder.query<AboutUsApiResponse, void>({
      query: () => ({ url: "/about-us", method: "GET" }),
    }),
  }),
});

export const { useGetAboutUsQuery } = aboutUsApi;
export * from "./utils";
