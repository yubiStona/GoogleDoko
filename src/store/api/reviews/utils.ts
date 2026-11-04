import type {
  ProductReview,
  ProductReviewsResponse,
  MyReviewItem,
} from "../../../api/client";

export type { ProductReview, ProductReviewsResponse, MyReviewItem };

export interface ReviewSubmissionPayload {
  productId: string;
  rating: number;
  comment: string;
  title?: string;
  orderId?: string;
  photos?: string[];
}

export interface ReviewResponse {
  ok: boolean;
  message?: string;
  review?: ProductReview;
  id?: number;
}
