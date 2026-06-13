export const BRAND = {
  name: "SAAJ by MF",
  tagline: "Modernity in Heritage",
  defaultEmail: "info@saajbymf.com",
  defaultPhone: "+92-300-1775557",
  defaultWhatsapp: "+923001775557",
  defaultCurrency: "PKR",
  defaultThemeColor: "#c4972a",
} as const;

export const CURRENCIES = ["PKR", "USD", "GBP", "EUR", "AED"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  PKR: "Rs.",
  USD: "$",
  GBP: "£",
  EUR: "€",
  AED: "AED",
};

export const PAYMENT_METHODS = {
  COD: "cod",
  CARD: "card",
  BANK: "bank",
  JAZZCASH: "jazzcash",
  EASYPAISA: "easypaisa",
  OTHER: "other",
} as const;

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  AWAITING_VERIFICATION: "awaiting_verification",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const API = {
  COLLECTIONS: "/api/collections",
  PRODUCTS: "/api/products",
  BANNERS: "/api/banners",
  CART: "/api/cart",
  ORDERS: "/api/orders",
  SETTINGS_PUBLIC: "/api/settings/public",
  AUTH_ME: "/api/auth/me",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_REGISTER: "/api/auth/register",
  UPLOAD: "/api/upload",
  UPLOAD_MULTIPLE: "/api/upload/multiple",
} as const;

export const QUERY_KEYS = {
  publicSettings: ["/api/settings/public"] as const,
  collections: ["/api/collections"] as const,
  products: ["/api/products"] as const,
  banners: ["/api/banners"] as const,
  authMe: ["/api/auth/me"] as const,
  cart: ["/api/cart"] as const,
};

export const ROUTES = {
  home: "/",
  shop: "/shop",
  collections: "/collections",
  collection: (slug: string) => `/collections/${slug}`,
  product: (slug: string) => `/product/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  account: "/account",
  login: "/login",
  register: "/register",
  orderSuccess: (id: string | number) => `/order-success/${id}`,
} as const;
