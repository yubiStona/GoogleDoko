import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";
import { clearCredentials } from "../slices/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.MODE === "test" ? "http://localhost:4000/api" : "/api"),
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token =
      (getState() as RootState).auth?.user?.token ||
      (getState() as RootState).auth?.token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("googledoko-token") ||
          sessionStorage.getItem("googledoko-token") ||
          localStorage.getItem("gd_token")
        : null);

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

  // Only a request that was sent WITH a token means "your session expired".
  // (A 401 from the login form just means "wrong password" and must not log anyone out.)
  const hadToken = !!(
    (api.getState() as RootState).auth?.user?.token ||
    (api.getState() as RootState).auth?.token ||
    (typeof window !== "undefined" &&
      (localStorage.getItem("googledoko-token") ||
        sessionStorage.getItem("googledoko-token") ||
        localStorage.getItem("gd_token")))
  );

  if (result.error?.status === 401 && hadToken) {
    api.dispatch(clearCredentials());
  }

  if (result.error) {
    return { error: result.error, meta: result.meta };
  }

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

  return { data: result.data, meta: result.meta };
};

export default baseQueryWithReauth;
export { baseQueryWithReauth };
