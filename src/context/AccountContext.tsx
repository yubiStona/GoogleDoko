import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { api, clearToken, getToken, setToken, type SessionPayload, type UserAddress, type RewardEntry } from "../api/client";
import { type MockAddress } from "../data/mockAddresses";
import { type AccountOrder } from "../data/mockOrders";
import { type MockReview } from "../data/mockReviews";
import {
  defaultNotificationSettings,
  type NotificationSettings,
} from "../data/mockSettings";
import { defaultMockUser, type MockUser } from "../data/mockUser";
import type { AccountRole, VendorProfile } from "../data/authOptions";
import { emitShopSession, isDemoCustomerEmail } from "../utils/shopSession";

// Use canonical types from API; keep MockAddress as alias for components that use it
export type { UserAddress };


export type AccountLanguage = "English" | "Nepali";

export interface CustomerSignupInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  photo: string;
}

export interface VendorSignupInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  vendor: Omit<VendorProfile, "status">;
}

interface AccountContextValue {
  isLoggedIn: boolean;
  loadingSession: boolean;
  user: MockUser;
  orders: AccountOrder[];
  addresses: MockAddress[];
  reviews: MockReview[];
  rewards: RewardEntry[];
  points: number;
  notifications: NotificationSettings;
  language: AccountLanguage;
  darkMode: boolean;
  toast: string | null;
  login: (
    identifier: string,
    password: string,
    remember?: boolean,
    expectedRole?: AccountRole,
  ) => Promise<string | null>;
  logout: () => void;
  registerCustomer: (input: CustomerSignupInput) => Promise<string | null>;
  registerVendor: (input: VendorSignupInput) => Promise<string | null>;
  registerAdmin: (input: { fullName: string; email: string; password: string; securityKey: string }) => Promise<string | null>;
  createShopOrder: (order: AccountOrder) => Promise<void>;
  updateUser: (next: Partial<Omit<MockUser, "vendor">> & { vendor?: Partial<VendorProfile> }) => Promise<void>;
  setPhoto: (photo: string) => Promise<void>;
  showToast: (message: string) => void;
  saveNotifications: (next: NotificationSettings) => void;
  setLanguage: (language: AccountLanguage) => void;
  setDarkMode: (on: boolean) => void;
  addAddress: (address: Omit<MockAddress, "id">) => void;
  updateAddress: (id: string, address: Partial<MockAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addReview: (review: Omit<MockReview, "id">) => void;
  updateReview: (id: string, review: Partial<MockReview>) => void;
  deleteReview: (id: string) => void;
  redeemPoints: (amount: number) => boolean;
  changePassword: (current: string, next: string) => Promise<string | null>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readBool(key: string, fallback: boolean) {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    return fallback;
  }
  return saved === "true";
}

function readLoggedIn() {
  return Boolean(getToken());
}

function asRole(role: string | undefined): AccountRole {
  if (role === "vendor" || role === "admin") {
    return role;
  }
  return "customer";
}

function userFromSession(payload: SessionPayload, prevUser?: MockUser): MockUser {
  const account = payload.user;
  return {
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    phone: account.phone,
    location: account.location,
    verified: account.verified,
    rewardPoints: payload.points ?? prevUser?.rewardPoints ?? 0,
    referralCode: account.referralCode,
    photo: account.photo || (account.vendor && (account.vendor as { photo?: string }).photo) || prevUser?.photo || "",
    password: "",
    role: asRole(account.role),
    vendor: (account.vendor as VendorProfile | undefined) || prevUser?.vendor,
  };
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [loadingSession, setLoadingSession] = useState(Boolean(getToken()));
  const [isLoggedIn, setIsLoggedIn] = useState(() => readLoggedIn());
  const [user, setUser] = useState<MockUser>(() => {
    const saved = readJson<MockUser>("googledoko-user", defaultMockUser);
    return {
      ...defaultMockUser,
      ...saved,
      role: asRole(saved.role),
      password: "",
    };
  });
  const [orders, setOrders] = useState<AccountOrder[]>(() =>
    readJson("googledoko-account-orders", []),
  );
  const [addresses, setAddresses] = useState<MockAddress[]>(() =>
    readJson("googledoko-addresses", []),
  );
  const [reviews, setReviews] = useState<MockReview[]>(() =>
    readJson("googledoko-reviews", []),
  );
  const [rewards, setRewards] = useState<RewardEntry[]>(() =>
    readJson("googledoko-rewards", []),
  );
  const [points, setPoints] = useState(() => readJson("googledoko-points", 0));
  const [notifications, setNotifications] = useState<NotificationSettings>(() =>
    readJson("googledoko-notifications", defaultNotificationSettings),
  );
  const [language, setLanguageState] = useState<AccountLanguage>(() =>
    readJson("googledoko-language", "English"),
  );
  const [darkMode, setDarkModeState] = useState(() =>
    readBool("googledoko-dark-mode", false),
  );
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef(0);
  const rememberLogin = useRef(true);

  const persistShop = useCallback(
    (next: {
      addresses?: MockAddress[];
      reviews?: MockReview[];
      rewards?: RewardEntry[];
      notifications?: NotificationSettings;
      language?: AccountLanguage;
      points?: number;
    }) => {
      void api
        .saveShop({
          addresses: next.addresses ?? addresses,
          reviews: next.reviews ?? reviews,
          rewards: next.rewards ?? rewards,
          notifications: next.notifications ?? notifications,
          language: next.language ?? language,
          points: next.points ?? points,
        })
        .catch((error) => setToast(error instanceof Error ? error.message : "Could not save changes"));
    },
    [addresses, language, notifications, points, reviews, rewards],
  );

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem("googledoko-logged-in", "false");
      return;
    }
    if (rememberLogin.current) {
      localStorage.setItem("googledoko-logged-in", "true");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    try {
      localStorage.setItem("googledoko-user", JSON.stringify({ ...user, password: "" }));
    } catch {
      // Photo data URLs can exceed quota; keep the in-memory profile anyway.
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("googledoko-account-orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("googledoko-addresses", JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem("googledoko-reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("googledoko-rewards", JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem("googledoko-points", JSON.stringify(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem("googledoko-notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("googledoko-language", JSON.stringify(language));
  }, [language]);

  useEffect(() => {
    localStorage.setItem("googledoko-dark-mode", "false");
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  const persistSession = useCallback((remember: boolean) => {
    rememberLogin.current = remember;
    sessionStorage.setItem("googledoko-session", "true");
    localStorage.setItem("googledoko-logged-in", remember ? "true" : "false");
    setIsLoggedIn(true);
  }, []);

  const applyPayload = useCallback(
    (payload: SessionPayload, remember = true) => {
      if (payload.token) {
        setToken(payload.token, remember);
      }
      const nextUser = userFromSession(payload);
      setUser(nextUser);
      try {
        localStorage.setItem("googledoko-user", JSON.stringify({ ...nextUser, password: "" }));
      } catch {
        // Ignore storage write errors (e.g. private browsing quota)
      }
      setOrders((payload.orders as AccountOrder[]) ?? []);
      setAddresses((payload.addresses as unknown as MockAddress[]) ?? []);
      setReviews((payload.reviews as MockReview[]) ?? []);
      setRewards((payload.rewards as RewardEntry[]) ?? []);
      setPoints(payload.points ?? 0);
      setNotifications(
        (payload.notifications as NotificationSettings) ?? defaultNotificationSettings,
      );
      setLanguageState((payload.language as AccountLanguage) || "English");
      const kind = isDemoCustomerEmail(nextUser.email) ? "demo" : "fresh";
      emitShopSession(kind, {
        cart: payload.cart,
        wishlist: payload.wishlist,
        orders: payload.orders,
        addresses: payload.addresses,
      });
      persistSession(remember);
    },
    [persistSession],
  );

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoadingSession(false);
      return;
    }
    void api
      .me()
      .then((payload) => applyPayload(payload, Boolean(localStorage.getItem("googledoko-token"))))
      .catch(() => {
        clearToken();
        setIsLoggedIn(false);
        setOrders([]); setAddresses([]); setReviews([]); setRewards([]); setPoints(0);
        emitShopSession("fresh", { cart: [], wishlist: [], orders: [], addresses: [] });
        sessionStorage.removeItem("googledoko-session");
        localStorage.setItem("googledoko-logged-in", "false");
      }).finally(() => setLoadingSession(false));
  }, [applyPayload]);

  const login = useCallback(
    async (
      identifier: string,
      password: string,
      remember = true,
      expectedRole?: AccountRole,
    ) => {
      try {
        const payload = await api.login({ identifier, password, expectedRole });
        applyPayload(payload, remember);
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : "Could not log in";
      }
    },
    [applyPayload],
  );

  const registerCustomer = useCallback(
    async (input: CustomerSignupInput) => {
      try {
        await api.registerCustomer(input);
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : "Could not create account";
      }
    },
    [],
  );

  const registerVendor = useCallback(async (input: VendorSignupInput) => {
    try {
      await api.registerVendor(input);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Could not create account";
    }
  }, []);

  const registerAdmin = useCallback(
    async (input: { fullName: string; email: string; password: string; securityKey: string }) => {
      try {
        await api.registerAdmin(input);
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : "Could not create admin account";
      }
    },
    [],
  );

  const value = useMemo<AccountContextValue>(
    () => ({
      isLoggedIn,
      loadingSession,
      user,
      orders,
      addresses,
      reviews,
      rewards,
      points,
      notifications,
      language,
      darkMode,
      toast,
      login,
      logout: () => {
        clearToken();
        setIsLoggedIn(false);
        setOrders([]); setAddresses([]); setReviews([]); setRewards([]); setPoints(0);
        emitShopSession("fresh", { cart: [], wishlist: [], orders: [], addresses: [] });
        sessionStorage.removeItem("googledoko-session");
        localStorage.setItem("googledoko-logged-in", "false");
        showToast("Logged out");
      },
      registerCustomer,
      registerVendor,
      registerAdmin,
      createShopOrder: async (order) => {
        const result = await api.createOrder(order);
        setOrders(result.orders as AccountOrder[]);
        window.dispatchEvent(new CustomEvent('googledoko-orders-updated', { detail: result.orders }));
      },
      updateUser: async (next) => {
        setUser((prev) => {
          const updated = {
            ...prev,
            ...next,
            vendor: next.vendor ? ({ ...prev.vendor, ...next.vendor } as VendorProfile) : prev.vendor,
          };
          try {
            localStorage.setItem("googledoko-user", JSON.stringify({ ...updated, password: "" }));
          } catch {
            // Ignore localStorage quota errors
          }
          return updated;
        });
        try {
          const payload = await api.updateProfile(next);
          setUser((prev) => userFromSession(payload, prev));
        } catch (err) {
          console.warn("Could not sync profile update to server", err);
        }
      },
      setPhoto: async (photo) => {
        setUser((prev) => {
          const next = { ...prev, photo };
          try {
            localStorage.setItem("googledoko-user", JSON.stringify({ ...next, password: "" }));
          } catch {
            // Ignore localStorage quota errors
          }
          return next;
        });
        try {
          const payload = await api.updateProfile({ photo });
          setUser((prev) => userFromSession(payload, prev));
        } catch (err) {
          console.warn("Could not sync photo to server", err);
        }
      },
      showToast,
      saveNotifications: (next) => {
        setNotifications(next);
        persistShop({ notifications: next });
      },
      setLanguage: (next) => { setLanguageState(next); persistShop({ language: next }); },
      setDarkMode: setDarkModeState,

      addAddress: async (address) => {
        try {
          const updated = await api.addAddress(address as Omit<UserAddress, "id">);
          setAddresses(updated as unknown as MockAddress[]);
          showToast("Address saved successfully");
        } catch (err: any) {
          showToast(err.message || "Could not save address");
        }
      },
      updateAddress: async (id, address) => {
        try {
          const updated = await api.updateAddress(id, address as Partial<UserAddress>);
          setAddresses(updated as unknown as MockAddress[]);
          showToast("Address updated successfully");
        } catch (err: any) {
          showToast(err.message || "Could not update address");
        }
      },
      deleteAddress: async (id) => {
        try {
          const updated = await api.deleteAddress(id);
          setAddresses(updated as unknown as MockAddress[]);
          showToast("Address deleted successfully");
        } catch (err: any) {
          showToast(err.message || "Could not delete address");
        }
      },
      setDefaultAddress: async (id) => {
        try {
          const updated = await api.setDefaultAddress(id);
          setAddresses(updated as unknown as MockAddress[]);
          showToast("Default address updated");
        } catch (err: any) {
          showToast(err.message || "Could not update default address");
        }
      },

      addReview: (review) => {
        setReviews((items) => {
          const list = [{ ...review, id: `rev-${Date.now()}` }, ...items];
          persistShop({ reviews: list });
          return list;
        });
        showToast("Review submitted successfully");
      },
      updateReview: (id, review) => {
        setReviews((items) => {
          const list = items.map((item) => (item.id === id ? { ...item, ...review } : item));
          persistShop({ reviews: list });
          return list;
        });
        showToast("Review updated successfully");
      },
      deleteReview: (id) => {
        setReviews((items) => {
          const list = items.filter((item) => item.id !== id);
          persistShop({ reviews: list });
          return list;
        });
        showToast("Review deleted");
      },

      redeemPoints: (amount) => {
        if (points < amount) { showToast("Not enough reward points"); return false; }
        // Optimistic update
        const nextPoints = points - amount;
        setPoints(nextPoints);
        setRewards((prev) => [{ id: `rw-${Date.now()}`, label: "Redeemed", points: -amount, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }, ...prev]);
        // Sync to backend
        api.redeemPoints(amount)
          .then((res) => { setPoints(res.points); setRewards(res.log as RewardEntry[]); })
          .catch(() => { setPoints(points); showToast("Could not redeem points"); });
        showToast(`${amount} points redeemed`);
        return true;
      },
      changePassword: async (current, next) => {
        try {
          await api.changePassword(current, next);
          showToast("Password updated");
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not update password";
        }
      },
    }),
    [
      addresses,
      darkMode,
      isLoggedIn,
      language,
      login,
      loadingSession,
      notifications,
      orders,
      persistShop,
      points,
      registerCustomer,
      registerVendor,
      reviews,
      rewards,
      showToast,
      toast,
      user,
    ],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used inside AccountProvider");
  }
  return context;
}

export function postLoginPath(role: AccountRole, from?: string) {
  if (role === "admin") {
    return "/admin";
  }
  if (role === "vendor") {
    return "/vendor";
  }
  if (
    from &&
    !from.startsWith("/login") &&
    !from.startsWith("/signup") &&
    !from.startsWith("/forgot-password") &&
    !from.startsWith("/vendor") &&
    !from.startsWith("/admin")
  ) {
    return from;
  }
  return "/account";
}
