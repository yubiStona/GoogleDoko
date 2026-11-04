import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type { SupportMessagePayload } from "./utils";

export const supportApi = createApi({
  reducerPath: "supportApi",
  baseQuery,
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation<{ ok: boolean }, { email: string }>({
      query: (body) => ({
        url: "/support/newsletter",
        method: "POST",
        body,
      }),
    }),
    sendSupportMessage: builder.mutation<
      { id: number },
      SupportMessagePayload
    >({
      query: (body) => ({
        url: "/support/message",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const contactUsApi = supportApi;

export const {
  useSubscribeNewsletterMutation,
  useSendSupportMessageMutation,
} = supportApi;

export * from "./utils";
