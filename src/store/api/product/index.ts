import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type { Product } from "./utils";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => "/products",
      providesTags: ["Products"],
    }),
    getPopularProducts: builder.query<Product[], number | void>({
      query: (limit = 8) => `/products/popular?limit=${limit}`,
      providesTags: ["Products"],
    }),
    getFeaturedProducts: builder.query<Product[], number | void>({
      query: (limit = 8) => `/products/featured?limit=${limit}`,
      providesTags: ["Products"],
    }),
    getLatestProducts: builder.query<Product[], number | void>({
      query: (limit = 8) => `/products/latest?limit=${limit}`,
      providesTags: ["Products"],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Products", id }],
    }),
  }),
});

export const productApis = productApi;

export const {
  useGetProductsQuery,
  useGetPopularProductsQuery,
  useGetFeaturedProductsQuery,
  useGetLatestProductsQuery,
  useGetProductByIdQuery,
} = productApi;

export * from "./utils";
