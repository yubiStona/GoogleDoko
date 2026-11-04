import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type {
  LifestyleCollection,
  LifestyleProductsResponse,
} from "./utils";

export const lifestyleApi = createApi({
  reducerPath: "lifestyleApi",
  baseQuery,
  tagTypes: ["Lifestyle"],
  endpoints: (builder) => ({
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
  }),
});

export const galleryApi = lifestyleApi;

export const {
  useGetLifestylesQuery,
  useGetLifestyleBySlugQuery,
  useGetLifestyleProductsQuery,
} = lifestyleApi;

export * from "./utils";
