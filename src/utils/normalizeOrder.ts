export interface NormalizedOrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: string;
  unit: string;
  origin: string;
  seller: string;
}

export interface NormalizedOrder {
  id: string;
  productId: string;
  status: "Delivered" | "Processing" | "Shipped" | "Cancelled" | "Pending";
  date: string;
  items: number;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  image: string;
  category: string;
  deliveryDate: string;
  products: NormalizedOrderItem[];
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: string;
}

export function normalizeOrder(raw: any): NormalizedOrder | null {
  if (!raw) return null;

  let parsedFromJson: any[] = [];
  if (typeof raw.itemsJson === "string") {
    try {
      const parsed = JSON.parse(raw.itemsJson);
      if (Array.isArray(parsed)) parsedFromJson = parsed;
    } catch {
      parsedFromJson = [];
    }
  }

  const rawList = Array.isArray(raw.products)
    ? raw.products
    : Array.isArray(raw.items)
      ? raw.items
      : parsedFromJson;

  const products: NormalizedOrderItem[] = rawList.map((item: any) => ({
    productId: String(item.productId || item.id || "1"),
    name: item.name || "Organic Farm Produce",
    image: item.image || "/src/frontend/assets/images/products/apple.jpg",
    price: Number(item.price) || 0,
    quantity: Math.max(1, Number(item.quantity) || 1),
    weight: item.weight || item.unit || "1 kg",
    unit: item.unit || item.weight || "1 kg",
    origin: item.origin || "Nepal",
    seller: item.seller || "Local Farm Seller",
  }));

  const totalQuantity =
    typeof raw.items === "number"
      ? raw.items
      : products.reduce((sum, p) => sum + p.quantity, 0) || 1;

  const first = products[0] || {
    productId: "1",
    name: "Organic Produce",
    image: "/src/frontend/assets/images/products/apple.jpg",
    price: 0,
  };

  const total = Number(raw.total) || 0;
  const subtotal = Number(raw.subtotal) || total;
  const deliveryFee = Number(raw.deliveryFee ?? raw.delivery_fee ?? 50);
  const discount = Number(raw.discount) || 0;

  return {
    id: String(raw.id),
    productId: raw.productId || first.productId || "1",
    status: raw.status || "Processing",
    date: raw.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    deliveryDate: raw.deliveryDate || "2–3 Days",
    total,
    subtotal,
    deliveryFee,
    discount,
    items: totalQuantity,
    image: raw.image || first.image || "/src/frontend/assets/images/products/apple.jpg",
    category: raw.category || first.name || "Organic Farm Produce",
    products,
    recipientName: raw.recipientName || raw.recipient_name || "Valued Customer",
    recipientPhone: raw.recipientPhone || raw.recipient_phone || "",
    deliveryAddress: raw.deliveryAddress || raw.delivery_address || "Kathmandu, Nepal",
    paymentMethod: raw.paymentMethod || raw.payment_method || "Cash on Delivery",
    paymentStatus: raw.paymentStatus || raw.payment_status || "Pending",
  };
}
