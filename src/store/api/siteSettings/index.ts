import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";

export const siteSettingsApi = createApi({
  reducerPath: "siteSettingsApi",
  baseQuery,
  tagTypes: ["SiteSettings"],
  endpoints: (builder) => ({
    getSiteSettings: builder.query<Record<string, string>, void>({
      query: () => "/admin/settings",
      providesTags: ["SiteSettings"],
    }),
    updateSiteSettings: builder.mutation<
      { ok: boolean },
      Record<string, string>
    >({
      query: (body) => ({
        url: "/admin/settings",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["SiteSettings"],
    }),
  }),
});

export const {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} = siteSettingsApi;
