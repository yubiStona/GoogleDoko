import { configureStore } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";

import { apiSlice } from "./api/apiSlice";
import { productApis } from "./api/product";
import { categoryApi } from "./api/categories";
import { placeApi } from "./api/brands";
import { lifestyleApi } from "./api/gallery";
import { offerApi } from "./api/hero";
import { reviewApi } from "./api/reviews";
import { orderApi } from "./api/orders";
import { authApi } from "./api/auth";
import { adminApi } from "./api/dashboard";
import { supportApi } from "./api/contactUs";
import { aboutUsApi } from "./api/aboutUs";
import { customerApi } from "./api/customer";
import { siteSettingsApi } from "./api/siteSettings";
import { projectApi } from "./api/projects";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [productApis.reducerPath]: productApis.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [placeApi.reducerPath]: placeApi.reducer,
    [lifestyleApi.reducerPath]: lifestyleApi.reducer,
    [offerApi.reducerPath]: offerApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [supportApi.reducerPath]: supportApi.reducer,
    [aboutUsApi.reducerPath]: aboutUsApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [siteSettingsApi.reducerPath]: siteSettingsApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      productApis.middleware,
      categoryApi.middleware,
      placeApi.middleware,
      lifestyleApi.middleware,
      offerApi.middleware,
      reviewApi.middleware,
      orderApi.middleware,
      authApi.middleware,
      adminApi.middleware,
      supportApi.middleware,
      aboutUsApi.middleware,
      customerApi.middleware,
      siteSettingsApi.middleware,
      projectApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
