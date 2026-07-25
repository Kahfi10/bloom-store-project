// ─── Flower Info (story panel) ─────────────────────────────────────────────
export interface FlowerInfo {
  origin: string;       // Asal daerah / negara
  latinName: string;    // Nama latin / ilmiah
  meaning: string;      // Makna simbolis
  history: string;      // Paragraf sejarah singkat
  funFact: string;      // Fakta menarik
  bloomSeason: string;  // Musim / kondisi mekar
}

// ─── Product ───────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number; // IDR, must be > 0
  stock: number; // must be >= 0
  description: string;
  heroImage: string; // first image, used on product cards
  images: string[];  // all images, used on product detail gallery
  info: FlowerInfo;  // flower story data
}

// ─── Cart ──────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  qty: number; // 1–10, must not exceed product.stock
}

/** Keyed by product.id */
export type CartStore = Record<number, CartItem>;

export interface CartActionResult {
  success: boolean;
  message: string;
}

// ─── Order ─────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export interface ShippingInfo {
  recipientName: string;
  shippingAddress: string;
  phoneNumber: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  shipping: ShippingInfo;
  status: OrderStatus;
  createdAt: string;
}

// ─── Toast ─────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  exiting?: boolean;
}
