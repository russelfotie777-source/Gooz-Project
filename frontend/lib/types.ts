// Mirrors backend/app/Http/Resources/*.php exactly, so swapping mock data
// for a real `fetch` call later requires no shape changes. See API.md.

export interface City {
  id: number;
  name: string;
}

export interface Neighborhood {
  id: number;
  city_id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface DeliveryEstimate {
  delivery_fee: number;
  distance_km: number;
  warehouse: {
    id: number;
    name: string;
  };
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  country_origin: string | null;
}

/** Flat — categories no longer nest under a parent (backend dropped parent_id). */
export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  /** Grid/card-sized variant (~400px) — null for images uploaded before this existed. */
  thumbnail_url: string | null;
  is_primary: boolean;
  product_variant_id: number | null;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string | null;
  /** Server-computed: name, else "size · color · material", else null. */
  display_name: string | null;
  size: string | null;
  color: string | null;
  material: string | null;
  base_price: number;
  promo_price: number | null;
  is_promotion: boolean;
  /** Already computed server-side: promo_price if is_promotion, else base_price. Don't recompute. */
  price: number;
  cost_price: number | null;
  tax_rate: number | null;
  barcode: string | null;
  is_active: boolean;
  images: ProductImage[];
  stock_quantity?: number;
}

export interface User {
  id: number;
  name: string;
  // Nullable because a social sign-in (Google/Facebook via Firebase) creates
  // the account before a phone number is known — see socialLogin() /
  // CompletePhoneModal, which collects it as a follow-up step.
  phone: string | null;
  role: "customer" | "admin" | "delivery";
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  /** Cheapest variant's effective price (promo if on sale, else base). Null if the product has no variants loaded/at all. */
  price_from: number | null;
  reference: string;
  is_active: boolean;
  brand?: Brand;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  stock_quantity?: number;
  created_at: string;
  updated_at: string;
}

export interface AppPromoImage {
  id: number;
  image: string;
  is_active: boolean;
  position: number;
}

export interface AppPromoSetting {
  is_active: boolean;
  images: AppPromoImage[];
}

export interface Banner {
  id: number;
  title: string;
  description: string | null;
  image: string;
  link_url: string | null;
  link_type: "external" | "product";
  product: Product | null;
  location: "homepage" | "homepage_ad_1" | "homepage_ad_2" | "category" | "search" | "checkout";
  position: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export interface Announcement {
  id: number;
  text: string;
  icon: string | null;
  link_url: string | null;
  position: number;
}

interface HomepageSectionBase {
  id: number;
  display_title: string;
  slug: string;
  description: string | null;
  display_layout: "horizontal_list" | "grid";
  show_title: boolean;
  show_view_all: boolean;
  view_all_url: string;
}

// content_type discriminates what HomepageSectionController::present()
// actually resolved this section to — category_list/brand_list strategies
// return categories/brands, not products, so the frontend has to switch on
// this rather than always expecting a product list.
export type HomepageSection =
  | (HomepageSectionBase & { content_type: "products"; products: Product[] })
  | (HomepageSectionBase & { content_type: "categories"; categories: Category[] })
  | (HomepageSectionBase & { content_type: "brands"; brands: Brand[] });

export interface Favorite {
  id: number;
  product: Product;
  created_at: string;
}

// Named AppNotification, not Notification — that name is already the
// browser's own global (Notification API), used elsewhere in lib/firebase.
export interface AppNotification {
  id: number;
  title: string;
  body: string | null;
  type: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  label: string | null;
  recipient_name: string;
  recipient_phone: string;
  country: string;
  region: string | null;
  ville: string;
  quartier: string | null;
  address_line: string | null;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type TicketPriority = "basse" | "moyenne" | "haute" | "urgente";
export type TicketStatus = "ouvert" | "en_cours" | "résolu" | "fermé";

export interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  message: string | null;
  assigned_to_id: number | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItemLine {
  id: number;
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Cart {
  id: number;
  items: CartItemLine[];
  total: number;
}

export interface Warehouse {
  id: number;
  name: string;
  region: string;
  ville: string;
  quartier: string;
  latitude: number;
  longitude: number;
  phone: string;
  is_active: boolean;
}

/** The real API's own enums (API.md §6) — distinct from the simplified
 * "domicile"/"agence" and "cash"/"online" values the checkout UI uses
 * internally; CheckoutContext maps between the two at submit time. */
export type ApiDeliveryMethod = "livraison" | "retrait";
export type ApiPaymentMethod = "carte" | "mobile_money" | "paypal" | "espèces";
export type OrderStatus = "en_attente" | "confirmée" | "en_préparation" | "expédiée" | "livrée" | "annulée";
export type PaymentStatus = "en_attente" | "payé" | "échoué" | "remboursé";

export interface OrderItemLine {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  id: number;
  order_reference: string;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  coupon_code: string | null;
  delivery_fees: number;
  delivery_method: ApiDeliveryMethod;
  shipping_address: string | null;
  shipping_phone: string;
  shipping_latitude: number | null;
  shipping_longitude: number | null;
  warehouse: Warehouse | null;
  items: OrderItemLine[];
  payment: {
    amount: number;
    payment_method: ApiPaymentMethod;
    payment_status: PaymentStatus;
    /** Enkap's hosted checkout page — set only for "mobile_money" orders. */
    checkout_url: string | null;
  };
  delivery: { delivery_status: string; tracking_code: string } | null;
  created_at: string;
}
