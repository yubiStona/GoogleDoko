import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery,
  tagTypes: ["Projects"],
  endpoints: (builder) => ({
    getProjects: builder.query<unknown[], void>({
      query: () => "/products",
      providesTags: ["Projects"],
    }),
  }),
});

export const { useGetProjectsQuery } = projectApi;
