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
  logo: string | null;
  description: string | null;
  country_origin: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image: string | null;
  is_active: boolean;
  children: Category[];
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  product_variant_id: number | null;
}

export interface ProductVariant {
  id: number;
  size: string | null;
  color: string | null;
  material: string | null;
  additional_price: number;
  barcode: string | null;
  is_active: boolean;
  images: ProductImage[];
  stock_quantity?: number;
}

export interface User {
  id: number;
  name: string;
  phone: string;
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
  description: string | null;
  base_price: number;
  promo_price: number | null;
  /** Already computed server-side: promo_price if is_promotion, else base_price. Don't recompute. */
  price: number;
  reference: string;
  is_active: boolean;
  is_promotion: boolean;
  brand?: Brand;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  stock_quantity?: number;
  created_at: string;
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
  status: string;
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
  payment: { amount: number; payment_method: ApiPaymentMethod; payment_status: string };
  delivery: { delivery_status: string; tracking_code: string } | null;
  created_at: string;
}
