import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, getToken, type UserAddress } from "../api/client";
import type { CartItem } from "./CartContext";
import type { Product } from "../data/products";
import { SHOP_SESSION_EVENT } from "../utils/shopSession";

export type AddressType = "Home" | "Work" | "Other";
export type PaymentMethod = "esewa" | "khalti" | "cod" | "bank";

export interface SavedAddress {
  id: string;
  label: AddressType;
  title: string;
  line: string;
  phone: string;
  fullName: string;
  province: string;
  district: string;
  area: string;
  street: string;
  landmark: string;
  postalCode: string;
}

export interface RecipientForm {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  area: string;
  street: string;
  landmark: string;
  postalCode: string;
  addressType: AddressType;
}

interface CheckoutContextValue {
  items: CartItem[];
  fromCart: boolean;
  selectedAddressId: string;
  addresses: SavedAddress[];
  form: RecipientForm;
  paymentMethod: PaymentMethod;
  lastOrderId: string | null;
  couponCode: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  isCalculating: boolean;
  calculationError: string | null;
  beginCheckout: (items: CartItem[], fromCart: boolean, initialCoupon?: string) => void;
  beginBuyNow: (product: Product, quantity?: number) => void;
  selectAddress: (id: string) => void;
  startNewAddress: () => void;
  updateForm: (field: keyof RecipientForm, value: string) => void;
  saveCurrentAddress: () => boolean;
  setPaymentMethod: (method: PaymentMethod) => void;
  setLastOrderId: (id: string | null) => void;
  applyCoupon: (code: string) => Promise<{ valid: boolean; message: string }>;
  removeCoupon: () => void;
  clearCheckout: () => void;
  recalculate: () => Promise<void>;
}

const storageKey = "googledoko-checkout";

const defaultAddresses: SavedAddress[] = [
  {
    id: "home",
    label: "Home",
    title: "Kathmandu Address",
    line: "Budhanilkantha-08, Gairigaon, Kathmandu, Bagmati Province",
    phone: "9851012345",
    fullName: "Lahana Lawaju",
    province: "Bagmati Province",
    district: "Kathmandu",
    area: "Budhanilkantha Area",
    street: "Gairigaon Marg",
    landmark: "Near Ganesh Mandir",
    postalCode: "44600",
  },
];

function formFromAddress(address: SavedAddress): RecipientForm {
  return {
    fullName: address.fullName,
    phone: address.phone,
    province: address.province,
    district: address.district,
    area: address.area,
    street: address.street,
    landmark: address.landmark || "",
    postalCode: address.postalCode,
    addressType: address.label,
  };
}

const emptyForm: RecipientForm = {
  fullName: "",
  phone: "",
  province: "Bagmati Province",
  district: "",
  area: "",
  street: "",
  landmark: "",
  postalCode: "",
  addressType: "Other",
};

interface PersistedCheckout {
  items: CartItem[];
  fromCart: boolean;
  selectedAddressId: string;
  addresses: SavedAddress[];
  form: RecipientForm;
  paymentMethod: PaymentMethod;
  lastOrderId: string | null;
  couponCode?: string;
}

function readCheckout(): PersistedCheckout {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved) as PersistedCheckout;
    }
  } catch {
    /* ignore */
  }

  return {
    items: [],
    fromCart: false,
    selectedAddressId: "home",
    addresses: defaultAddresses,
    form: formFromAddress(defaultAddresses[0]),
    paymentMethod: "cod",
    lastOrderId: null,
    couponCode: "",
  };
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const initial = readCheckout();
  const [items, setItems] = useState<CartItem[]>(initial.items);
  const [fromCart, setFromCart] = useState(initial.fromCart);
  const [addresses, setAddresses] = useState<SavedAddress[]>(initial.addresses);
  const [selectedAddressId, setSelectedAddressId] = useState(initial.selectedAddressId);
  const [form, setForm] = useState<RecipientForm>(initial.form);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial.paymentMethod);
  const [lastOrderId, setLastOrderId] = useState<string | null>(initial.lastOrderId);
  const [couponCode, setCouponCode] = useState<string>(initial.couponCode || "");

  // Server-computed figures
  const [subtotal, setSubtotal] = useState(() =>
    initial.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const [deliveryFee, setDeliveryFee] = useState(initial.items.length > 0 ? 50 : 0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(() =>
    Math.max(0, initial.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + (initial.items.length > 0 ? 50 : 0))
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Recalculate totals directly via backend calculation endpoint
  const recalculate = useCallback(async () => {
    if (items.length === 0) {
      setSubtotal(0);
      setDeliveryFee(0);
      setDiscount(0);
      setTotal(0);
      setCalculationError(null);
      return;
    }

    setIsCalculating(true);
    try {
      const calc = await api.calculateCheckout(
        items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        couponCode || undefined
      );

      setSubtotal(calc.subtotal);
      setDeliveryFee(calc.deliveryFee);
      setDiscount(calc.discount);
      setTotal(calc.total);

      if (!calc.valid) {
        const errorItem = calc.items.find((i) => !i.inStock || i.error);
        setCalculationError(errorItem?.error || "Some items in your checkout are out of stock.");
      } else {
        setCalculationError(null);
      }
    } catch {
      // Fallback local computation if network fails
      const fallbackSub = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const fallbackFee = fallbackSub >= 1500 ? 0 : (fallbackSub > 0 ? 50 : 0);
      setSubtotal(fallbackSub);
      setDeliveryFee(fallbackFee);
      setTotal(fallbackSub + fallbackFee);
    } finally {
      setIsCalculating(false);
    }
  }, [items, couponCode]);

  useEffect(() => {
    void recalculate();
  }, [recalculate]);

  // Persist state in localStorage
  useEffect(() => {
    const payload: PersistedCheckout = {
      items,
      fromCart,
      selectedAddressId,
      addresses,
      form,
      paymentMethod,
      lastOrderId,
      couponCode,
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [
    items,
    fromCart,
    selectedAddressId,
    addresses,
    form,
    paymentMethod,
    lastOrderId,
    couponCode,
  ]);

  // Sync addresses from backend DB session
  useEffect(() => {
    function mapAddress(addr: UserAddress | any): SavedAddress {
      const city = addr.city || addr.district || "";
      const district = addr.province || addr.district || city;
      return {
        id: String(addr.id),
        label: (addr.label as AddressType) || "Home",
        title: `${city || district} ${addr.label || "Address"}`,
        line: [addr.street, addr.area, city, district].filter(Boolean).join(", "),
        phone: addr.phone || "",
        fullName: addr.fullName || addr.full_name || "",
        province: addr.province || "Bagmati Province",
        district: city || district,
        area: addr.area || "",
        street: addr.street || "",
        landmark: addr.landmark || "",
        postalCode: addr.postalCode || addr.postal_code || "",
      };
    }

    if (getToken()) {
      api.getAddresses().then((serverAddrs) => {
        if (serverAddrs && serverAddrs.length > 0) {
          const mapped = serverAddrs.map(mapAddress);
          setAddresses(mapped);
          const defaultOne = serverAddrs.find((a) => a.isDefault) || serverAddrs[0];
          if (defaultOne) {
            setSelectedAddressId(String(defaultOne.id));
            setForm(formFromAddress(mapAddress(defaultOne)));
          }
        }
      }).catch(() => {});
    }

    function handleSession(event: Event) {
      const detail = (event as CustomEvent).detail;
      const rawAddrs = detail?.addresses || [];
      if (Array.isArray(rawAddrs) && rawAddrs.length > 0) {
        const saved: SavedAddress[] = rawAddrs.map(mapAddress);
        setAddresses(saved);
        if (saved[0]) {
          setSelectedAddressId(saved[0].id);
          setForm(formFromAddress(saved[0]));
        }
      }
      const identity = sessionStorage.getItem("googledoko-checkout-owner");
      const owner = getToken();
      if (identity !== owner) {
        setItems([]);
        setFromCart(false);
        setLastOrderId(null);
        setCouponCode("");
      }
      sessionStorage.setItem("googledoko-checkout-owner", owner);
    }

    window.addEventListener(SHOP_SESSION_EVENT, handleSession);
    return () => window.removeEventListener(SHOP_SESSION_EVENT, handleSession);
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      return { valid: false, message: "Please enter a coupon code" };
    }
    try {
      const res = await api.validateCoupon(trimmed, subtotal);
      if (res.valid) {
        setCouponCode(trimmed);
        return { valid: true, message: res.message || `Coupon "${trimmed}" applied successfully!` };
      }
      return { valid: false, message: res.error || `Invalid coupon code "${trimmed}"` };
    } catch (err: any) {
      return { valid: false, message: err.message || `Invalid coupon code "${trimmed}"` };
    }
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setCouponCode("");
  }, []);

  const clearCheckout = useCallback(() => {
    setItems([]);
    setFromCart(false);
    setCouponCode("");
  }, []);

  const value = useMemo<CheckoutContextValue>(
    () => ({
      items,
      fromCart,
      selectedAddressId,
      addresses,
      form,
      paymentMethod,
      lastOrderId,
      couponCode,
      subtotal,
      deliveryFee,
      discount,
      total,
      isCalculating,
      calculationError,
      beginCheckout: (nextItems, nextFromCart, initialCoupon) => {
        setItems(nextItems);
        setFromCart(nextFromCart);
        if (initialCoupon) {
          setCouponCode(initialCoupon);
        }
      },
      beginBuyNow: (product, quantity = 1) => {
        setItems([
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
        ]);
        setFromCart(false);
      },
      selectAddress: (id) => {
        const address = addresses.find((item) => item.id === id);
        setSelectedAddressId(id);
        if (address) {
          setForm(formFromAddress(address));
        }
      },
      startNewAddress: () => {
        setSelectedAddressId("new");
        setForm(emptyForm);
      },
      updateForm: (field, val) => {
        setForm((current) => ({ ...current, [field]: val }));
      },
      saveCurrentAddress: () => {
        const required: (keyof RecipientForm)[] = [
          "fullName",
          "phone",
          "province",
          "district",
          "area",
          "street",
        ];

        if (required.some((field) => !form[field]?.trim())) {
          return false;
        }

        if (!/^9\d{9}$/.test(form.phone.trim())) {
          return false;
        }

        const line = [
          form.street,
          form.area,
          form.landmark ? `Landmark: ${form.landmark}` : "",
          form.district,
          form.province,
        ]
          .filter(Boolean)
          .join(", ");

        const newId = selectedAddressId === "new" ? `addr-${Date.now()}` : selectedAddressId;

        const nextAddress: SavedAddress = {
          id: newId,
          label: form.addressType,
          title:
            form.addressType === "Home"
              ? `${form.district} Address`
              : form.addressType === "Work"
                ? `${form.district} Office`
                : "Other Address",
          line,
          phone: form.phone.trim(),
          fullName: form.fullName.trim(),
          province: form.province,
          district: form.district,
          area: form.area,
          street: form.street,
          landmark: form.landmark,
          postalCode: form.postalCode,
        };

        setAddresses((current) => {
          const exists = current.some((item) => item.id === nextAddress.id);
          return exists
            ? current.map((item) => (item.id === nextAddress.id ? nextAddress : item))
            : [...current, nextAddress];
        });
        setSelectedAddressId(nextAddress.id);

        // Persist to backend database if logged in
        if (getToken()) {
          api.addAddress({
            label: form.addressType,
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            province: form.province,
            city: form.district,
            area: form.area,
            street: form.street,
            postalCode: form.postalCode,
            isDefault: selectedAddressId === "new" || selectedAddressId === "home",
          }).catch(() => {});
        }

        return true;
      },
      setPaymentMethod,
      setLastOrderId,
      applyCoupon,
      removeCoupon,
      clearCheckout,
      recalculate,
    }),
    [
      items,
      fromCart,
      selectedAddressId,
      addresses,
      form,
      paymentMethod,
      lastOrderId,
      couponCode,
      subtotal,
      deliveryFee,
      discount,
      total,
      isCalculating,
      calculationError,
      applyCoupon,
      removeCoupon,
      recalculate,
    ],
  );

  return (
    <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error("useCheckout must be used inside CheckoutProvider");
  }

  return context;
}

export const paymentLabels: Record<PaymentMethod, string> = {
  esewa: "eSewa Mobile Wallet",
  khalti: "Khalti Wallet",
  cod: "Cash on Delivery",
  bank: "Direct Bank Transfer",
};
