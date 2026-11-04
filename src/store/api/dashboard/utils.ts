import type {
  AdminOverview,
  AdminVendor,
  AdminOrder,
  SupportMessage,
} from "../../../api/client";

export type {
  AdminOverview,
  AdminVendor,
  AdminOrder,
  SupportMessage,
};

export interface Coupon {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order: number;
  max_uses: number;
  times_used: number;
  expiry_date?: string | null;
  active: number;
  created_at: string;
}
