import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "../data/products";
import { products } from "../data/products";
import { orders as seedOrders, type Order } from "../data/orders";
import { SHOP_SESSION_EVENT } from "../utils/shopSession";
import { normalizeOrder } from "../utils/normalizeOrder";
import { api, getToken } from "../api/client";

interface OrdersContextValue {
  orders: Order[];
  addOrder: (product: Product, quantity?: number) => void;
  placeCheckoutOrder: (input: {
    items: {
      id: string;
      name: string;
      image: string;
      price: number;
      quantity: number;
      origin?: string;
      seller?: string;
      unit?: string;
    }[];
    recipientName: string;
    recipientPhone: string;
    deliveryAddress: string;
    paymentMethod: string;
    total: number;
  }) => Order;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

const storageKey = "googledoko-orders";

function formatOrderDate(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDeliveryDate(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function withProductId(order: Order): Order {
  if (order.productId) {
    return order;
  }

  const match = products.find(
    (item) =>
      item.name === order.category ||
      item.name === order.products[0]?.name,
  );

  return {
    ...order,
    productId: match?.id ?? "1",
  };
}

function readOrders(): Order[] {
  try {
    const token = getToken();
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return (JSON.parse(saved) as Order[]).map(withProductId);
    }
    return token ? [] : seedOrders;
  } catch {
    return [];
  }
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(readOrders);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api
        .getUserOrders()
        .then((serverOrders) => {
          if (Array.isArray(serverOrders)) {
            const normalized = serverOrders.map(normalizeOrder).filter(Boolean) as Order[];
            setOrders(normalized);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    function hydrate(raw: unknown) {
      if (!Array.isArray(raw)) return;
      const normalized = raw.map(normalizeOrder).filter(Boolean) as Order[];
      setOrders(normalized);
    }
    function handleSession(event: Event) { hydrate((event as CustomEvent).detail?.orders || []); }
    function handleOrders(event: Event) { hydrate((event as CustomEvent).detail); }
    window.addEventListener(SHOP_SESSION_EVENT, handleSession);
    window.addEventListener('googledoko-orders-updated', handleOrders);
    return () => { window.removeEventListener(SHOP_SESSION_EVENT, handleSession); window.removeEventListener('googledoko-orders-updated', handleOrders); };
  }, []);

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders,
      addOrder: (product, quantity = 1) => {
        const now = new Date();
        const delivery = new Date(now);
        delivery.setDate(delivery.getDate() + 2);

        const order: Order = {
          id: `LM${now.getTime()}`,
          productId: product.id,
          status: "Processing",
          date: formatOrderDate(now),
          items: quantity,
          total: product.price * quantity,
          image: product.image,
          category: product.name,
          deliveryDate: formatDeliveryDate(delivery),
          products: [
            {
              name: product.name,
              image: product.image,
              price: product.price,
              quantity,
              origin: product.origin,
              seller: product.seller,
              unit: product.weight,
            },
          ],
        };

        setOrders((current) => [order, ...current]);
      },
      placeCheckoutOrder: (input) => {
        const now = new Date();
        const delivery = new Date(now);
        delivery.setDate(delivery.getDate() + 2);
        const first = input.items[0];
        const itemsCount = input.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const paid =
          input.paymentMethod !== "Cash on Delivery" &&
          input.paymentMethod !== "cod";

        const order: Order = {
          id: `GD-${now.getFullYear()}-${String(now.getTime()).slice(-5)}`,
          productId: first?.id ?? "1",
          status: "Processing",
          date: formatOrderDate(now),
          items: itemsCount,
          total: input.total,
          image: first?.image ?? "",
          category: input.items.length > 1 ? "Mixed Order" : (first?.name ?? "Order"),
          deliveryDate: formatDeliveryDate(delivery),
          recipientName: input.recipientName,
          recipientPhone: input.recipientPhone,
          deliveryAddress: input.deliveryAddress,
          paymentMethod: input.paymentMethod,
          paymentStatus: paid ? "Paid" : "Pending (Cash on Delivery)",
          products: input.items.map((item) => ({
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            origin: item.origin,
            seller: item.seller,
            unit: item.unit,
          })),
        };

        setOrders((current) => [order, ...current]);
        return order;
      },
    }),
    [orders],
  );

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error("useOrders must be used inside OrdersProvider");
  }

  return context;
}
