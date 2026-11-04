import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { api, getToken, type CartItem } from "../api/client";
import { products, type Product } from "../data/products";
import { SHOP_SESSION_EVENT, type ShopSessionKind } from "../utils/shopSession";

// Re-export CartItem so existing imports from this file still work
export type { CartItem };

export function normalizeCartItem(raw: any): CartItem {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      name: "Product",
      weight: "1 kg",
      price: 0,
      quantity: 1,
      image: "",
    };
  }

  const prod = raw.product && typeof raw.product === "object" ? raw.product : {};
  const id = String(raw.id || raw.productId || prod.id || "");
  const catalogProd = id ? products.find((p) => String(p.id) === id) : undefined;

  const rawName =
    raw.name && raw.name !== "Product"
      ? raw.name
      : prod.name || catalogProd?.name || raw.name || "Product";
  const name = String(rawName);

  const rawPrice = raw.price ?? prod.price ?? catalogProd?.price ?? 0;
  const price =
    typeof rawPrice === "number" && !isNaN(rawPrice)
      ? rawPrice
      : Number(rawPrice) || 0;

  const rawQty = raw.quantity ?? 1;
  const quantity = Math.max(
    1,
    typeof rawQty === "number" && !isNaN(rawQty)
      ? rawQty
      : Number(rawQty) || 1,
  );

  const weight = String(raw.weight || prod.weight || catalogProd?.weight || "1 kg");
  let image = String(raw.image || prod.image || catalogProd?.image || "");
  if (image.startsWith("/src/frontend/assets/")) {
    image = image.replace("/src/frontend/assets/", "/src/assets/");
  }

  const origin = raw.origin || prod.origin || catalogProd?.origin || "";
  const seller = raw.seller || prod.seller || catalogProd?.seller || "";
  const category = raw.category || prod.category || catalogProd?.category || "";
  const sellingUnit = raw.sellingUnit || prod.sellingUnit || catalogProd?.sellingUnit || "";
  const allowDecimals = raw.allowDecimals !== undefined ? raw.allowDecimals : (prod.allowDecimals ?? catalogProd?.allowDecimals ?? 0);
  const variant = raw.variant || prod.selectedVariant || raw.selectedVariant || null;

  return {
    id,
    name,
    weight,
    sellingUnit,
    allowDecimals,
    variant,
    category,
    price,
    quantity,
    image,
    origin,
    seller,
  };
}

interface CartContextValue {
  cartItems: CartItem[];
  toast: string | null;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, change: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const storageKey = "googledoko-cart";

function getUserKey(prefix: string): string {
  try {
    const raw = localStorage.getItem("googledoko-user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u.email) return `${prefix}_${u.email.toLowerCase().trim()}`;
      if (u.id) return `${prefix}_${u.id}`;
    }
  } catch {
    // Ignore JSON parse errors
  }
  return prefix;
}

function readLocalCart(): CartItem[] {
  try {
    const userKey = getUserKey(storageKey);
    let items: any[] = [];
    if (userKey !== storageKey) {
      const userSaved = localStorage.getItem(userKey);
      if (userSaved) {
        const parsed = JSON.parse(userSaved);
        if (Array.isArray(parsed) && parsed.length > 0) items = parsed;
      }
    }
    if (items.length === 0) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) items = parsed;
      }
    }
    return items.map(normalizeCartItem).filter((item) => item.id);
  } catch {
    return [];
  }
}

function writeLocalCart(items: CartItem[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
    const userKey = getUserKey(storageKey);
    if (userKey !== storageKey) {
      localStorage.setItem(userKey, JSON.stringify(items));
    }
  } catch { /* ignore */ }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(readLocalCart);
  const isLoggedIn = useRef(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>(0);

  // Keep localStorage in sync for offline/guest
  useEffect(() => { writeLocalCart(cartItems); }, [cartItems]);

  // Initial sync on mount if already authenticated
  useEffect(() => {
    if (getToken()) {
      isLoggedIn.current = true;
      api.getCart()
        .then((fresh) => {
          if (Array.isArray(fresh)) {
            const normalized = fresh.map(normalizeCartItem).filter((i) => i.id);
            setCartItems(normalized);
            writeLocalCart(normalized);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Load cart from DB on login; merge guest/user-cached cart into DB cart
  useEffect(() => {
    function handleSession(event: Event) {
      const detail = (event as CustomEvent<{ kind?: ShopSessionKind; cart?: CartItem[] }>).detail;
      const token = getToken();

      if (token) {
        isLoggedIn.current = true;
        const localItems = readLocalCart();
        const serverItems: CartItem[] = Array.isArray(detail?.cart)
          ? detail.cart.map(normalizeCartItem).filter((i) => i.id)
          : [];

        const mergeAndLoad = async () => {
          try {
            // Push any local items not yet on server
            for (const item of localItems) {
              const alreadyOnServer = serverItems.find((s) => s.id === item.id);
              if (!alreadyOnServer && item.quantity > 0) {
                await api.addToCart(item.id, item.quantity).catch(() => {});
              }
            }
            const fresh = await api.getCart();
            const list = Array.isArray(fresh) ? fresh.map(normalizeCartItem).filter((i) => i.id) : [];
            const merged = list.length > 0 ? list : (localItems.length > 0 ? localItems : serverItems);
            setCartItems(merged);
            writeLocalCart(merged);
          } catch {
            const fallback = localItems.length > 0 ? localItems : serverItems;
            setCartItems(fallback);
            writeLocalCart(fallback);
          }
        };
        void mergeAndLoad();
      } else {
        isLoggedIn.current = false;
        if (Array.isArray(detail?.cart)) {
          const normalized = detail.cart.map(normalizeCartItem).filter((i) => i.id);
          setCartItems(normalized);
        } else if (detail?.kind === "fresh") {
          setCartItems([]);
          try { localStorage.setItem(storageKey, "[]"); } catch { /* ignore storage error */ }
        }
      }
    }

    window.addEventListener(SHOP_SESSION_EVENT, handleSession);
    return () => window.removeEventListener(SHOP_SESSION_EVENT, handleSession);
  }, []);

  useEffect(() => { return () => window.clearTimeout(toastTimer.current); }, []);

  function showToast(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems,
      toast,

      addToCart: (product, quantity = 1) => {
        let nextItems: CartItem[] = [];
        setCartItems((items) => {
          const existing = items.find((item) => item.id === product.id);
          if (existing) {
            nextItems = items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          } else {
            nextItems = [
              ...items,
              {
                id: product.id,
                name: product.name,
                weight: product.weight,
                sellingUnit: (product as any).sellingUnit || "",
                allowDecimals: (product as any).allowDecimals ?? 0,
                variant: (product as any).selectedVariant || (product as any).variant || null,
                category: product.category,
                price: product.price,
                quantity,
                image: product.image,
                origin: product.origin,
                seller: product.seller,
              },
            ];
          }
          writeLocalCart(nextItems);
          return nextItems;
        });

        if (getToken()) {
          api.addToCart(product.id, quantity)
            .then((fresh) => {
              if (Array.isArray(fresh) && fresh.length > 0) {
                const normalized = fresh.map(normalizeCartItem).filter((i) => i.id);
                setCartItems(normalized);
                writeLocalCart(normalized);
              }
            })
            .catch(() => { /* keep optimistic state */ });
        }

        showToast("Successfully added to cart");
      },

      updateQuantity: (id, change) => {
        setCartItems((items) => {
          const updated = items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, item.quantity + change) }
              : item,
          );
          writeLocalCart(updated);
          if (getToken()) {
            const newQty = updated.find((i) => i.id === id)?.quantity;
            if (newQty) {
              api.updateCartItem(id, newQty)
                .then((fresh) => {
                  if (Array.isArray(fresh)) {
                    const normalized = fresh.map(normalizeCartItem).filter((i) => i.id);
                    setCartItems(normalized);
                    writeLocalCart(normalized);
                  }
                })
                .catch(() => { /* keep optimistic */ });
            }
          }
          return updated;
        });
      },

      removeItem: (id) => {
        setCartItems((items) => {
          const updated = items.filter((item) => item.id !== id);
          writeLocalCart(updated);
          return updated;
        });
        if (getToken()) {
          api.removeFromCart(id)
            .then((fresh) => {
              if (Array.isArray(fresh)) {
                const normalized = fresh.map(normalizeCartItem).filter((i) => i.id);
                setCartItems(normalized);
                writeLocalCart(normalized);
              }
            })
            .catch(() => {});
        }
      },

      clearCart: () => {
        setCartItems([]);
        writeLocalCart([]);
        if (getToken()) {
          api.clearCart().catch(() => {});
        }
      },
    }),
    [cartItems, toast],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
