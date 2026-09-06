/**
 * Zivo domain types — single source of truth for the mock data layer.
 * Modeled on PRD §16 (Product), §24 (Address), §25 (Order).
 * These types are backend-agnostic: a future real API can return the
 * same shapes without refactoring the UI.
 */

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  /** Optional parent for hierarchical categories (e.g. «بادی و گن»). */
  parentId?: string | null;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
};

export type ProductStatus = "active" | "draft" | "archived";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

/** A product color that is unavailable for the current product. */
export type Review = {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title?: string;
  content: string;
  /** ISO date string */
  date: string;
  images?: string[];
  verifiedPurchase: boolean;
};

export type ProductColor = {
  /** Persian display name, e.g. «مشکی» */
  name: string;
  /** Hex value used for the color swatch */
  hex: string;
  /** Optional variant image for this color */
  image?: string;
};

export type ProductSize = {
  id: string;
  name: string;
  stock: number;
  isActive: boolean;
};

export type ProductColorWithImage = ProductColor & {
  id: string;
  image?: string | null;
};

export type ProductSizeWithStock = ProductSize & {
  stock: number;
  isAvailable: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  description: string;
  /** Structured rich description blocks (PRD §20). */
  details?: RichBlock[];
  images: string[];
  videos?: string[];
  sizes: string[];
  colors: ProductColor[];
  productColors?: ProductColorWithImage[];
  productSizes?: ProductSizeWithStock[];
  price: number;
  discountPrice?: number | null;
  discountPercent?: number | null;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  stock: number;
  status: ProductStatus;
  createdAt: string;
  isNew?: boolean;
  isBestseller?: boolean;
};

/** Rich content block for product descriptions (PRD §20). */
export type RichBlock =
  | { type: "text"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export type Address = {
  id?: string;
  title: string;
  province: string;
  city: string;
  provinceId?: string;
  cityId?: string;
  postalCode: string;
  fullAddress: string;
  receiverName?: string;
  receiverPhone?: string;
  isDefault?: boolean;
};

export type OrderStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  /** Discount applied on the unit price (in the same currency unit). */
  unitDiscount: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: Address;
  customerNote?: string;
  trackNo?: string;
  status: OrderStatus;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  /** Login identity. Not editable in the profile (PRD §32). */
  mobile: string;
  email?: string | null;
  /** Mock only — a real backend would store a hash. */
  password: string;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  discountPrice?: number | null;
  size: string;
  color: string;
  quantity: number;
  stock: number;
};

export type ProvinceCity = {
  province: string;
  cities: string[];
};

export type Province = {
  id: string;
  name: string;
  slug: string;
  cities: City[];
};

export type City = {
  id: string;
  name: string;
  slug: string;
};
