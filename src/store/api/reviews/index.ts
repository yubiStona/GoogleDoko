import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";
import type {
  MyReviewItem,
  ProductReviewsResponse,
  ReviewResponse,
  ReviewSubmissionPayload,
} from "./utils";

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery,
  tagTypes: ["Reviews"],
  endpoints: (builder) => ({
    getProductReviews: builder.query<
      ProductReviewsResponse,
      { productId: string; page?: number; limit?: number; sort?: string }
    >({
      query: ({ productId, ...params }) => ({
        url: `/reviews/product/${productId}`,
        params,
      }),
      providesTags: (_result, _error, { productId }) => [
        { type: "Reviews", id: productId },
      ],
    }),
    getMyReviews: builder.query<MyReviewItem[], void>({
      query: () => "/reviews/my-reviews",
      providesTags: ["Reviews"],
    }),
    submitReview: builder.mutation<ReviewResponse, ReviewSubmissionPayload>({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reviews"],
    }),
    voteHelpful: builder.mutation<
      { ok: boolean; helpfulCount: number },
      { reviewId: number }
    >({
      query: ({ reviewId }) => ({
        url: `/reviews/${reviewId}/vote`,
        method: "POST",
      }),
      invalidatesTags: ["Reviews"],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetMyReviewsQuery,
  useSubmitReviewMutation,
  useVoteHelpfulMutation,
} = reviewApi;

export * from "./utils";
