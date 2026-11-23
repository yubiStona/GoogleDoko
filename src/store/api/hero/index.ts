import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type { OffersResponse } from "./utils";

export interface LandingPageContent {
  eyebrow: string;
  title: string;
  description: string;
  backgroundImage: string;
  food: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
    image: string;
    imageAlt: string;
    href: string;
  };
  lifestyle: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
    image: string;
    imageAlt: string;
    href: string;
  };
}

export const offerApi = createApi({
  reducerPath: "offerApi",
  baseQuery,
  tagTypes: ["Offers"],
  endpoints: (builder) => ({
    getLandingPageContent: builder.query<LandingPageContent, void>({
      query: () => "/landing",
    }),
    getOffers: builder.query<OffersResponse, void>({
      query: () => "/offers",
      providesTags: ["Offers"],
    }),
  }),
});

export const heroApi = offerApi;

export const { useGetLandingPageContentQuery, useGetOffersQuery } = offerApi;
export * from "./utils";
