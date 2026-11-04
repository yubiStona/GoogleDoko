import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../api/types";

export interface AuthState {
  user: (User & { token?: string }) | null;
  token: string | null;
  isAuthChecked: boolean;
}

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("googledoko-token") ||
    sessionStorage.getItem("googledoko-token") ||
    localStorage.getItem("gd_token")
  );
};

const initialToken = getStoredToken();

const initialState: AuthState = {
  user: initialToken ? ({ token: initialToken } as User & { token?: string }) : null,
  token: initialToken,
  isAuthChecked: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = { ...action.payload.user, token: action.payload.token };
      state.token = action.payload.token;
      state.isAuthChecked = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("googledoko-token", action.payload.token);
        localStorage.setItem("gd_token", action.payload.token);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthChecked = true;
      if (typeof window !== "undefined") {
        localStorage.removeItem("googledoko-token");
        sessionStorage.removeItem("googledoko-token");
        localStorage.removeItem("gd_token");
      }
    },
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;
