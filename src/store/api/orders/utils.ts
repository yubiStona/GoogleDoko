export interface OrderItem {
  id?: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  weight?: string;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  items: OrderItem[];
}
