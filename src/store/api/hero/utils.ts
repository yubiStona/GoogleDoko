import type { ApiOfferBanner } from "../../../api/client";

export interface OffersResponse {
  banners: ApiOfferBanner[];
  activeCoupons?: Array<{
    id: number;
    code: string;
    discountType: string;
    discountValue: number;
    minOrder: number;
    expiryDate: string;
    description: string;
  }>;
}
