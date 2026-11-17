import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { RootState } from "../index";
import { clearCredentials } from "../slices/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.MODE === "test" ? "http://localhost:4000/api" : "/api"),
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.user?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error) {
    if (result.error.status === 401) {
      api.dispatch(clearCredentials());
      if (typeof window !== "undefined" && window.location?.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return result;
  }

  // Automatically unwrap backend { success, data } envelope so components receive pure data
  if (
    result.data &&
    typeof result.data === "object" &&
    "data" in (result.data as Record<string, unknown>) &&
    (result.data as Record<string, unknown>).data !== undefined
  ) {
    return {
      data: (result.data as Record<string, unknown>).data,
      meta: result.meta,
    };
  }

  return result;
};

export default baseQueryWithReauth;

