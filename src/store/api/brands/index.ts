import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type {
  ApiPlace,
  PlaceCategorySummary,
  PlaceProductsResponse,
  Product,
} from "./utils";

export const placeApi = createApi({
  reducerPath: "placeApi",
  baseQuery,
  tagTypes: ["Places"],
  endpoints: (builder) => ({
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
  }),
});

export const brandApi = placeApi;

export const {
  useGetPlacesQuery,
  useGetPlaceBySlugQuery,
  useGetPlaceCategoriesQuery,
  useGetPlaceProductsQuery,
  useGetPlacePopularProductsQuery,
} = placeApi;

export * from "./utils";
