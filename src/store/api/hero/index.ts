import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type { OffersResponse } from "./utils";

export const offerApi = createApi({
  reducerPath: "offerApi",
  baseQuery,
  tagTypes: ["Offers"],
  endpoints: (builder) => ({
    getOffers: builder.query<OffersResponse, void>({
      query: () => "/offers",
      providesTags: ["Offers"],
    }),
  }),
});

export const heroApi = offerApi;

export const { useGetOffersQuery } = offerApi;
export * from "./utils";
