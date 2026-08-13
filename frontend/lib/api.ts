import type {
  ApiPaymentMethod,
  AuthResponse,
  Brand,
  Cart,
  CartItemLine,
  Category,
  City,
  DeliveryEstimate,
  Neighborhood,
  Order,
  OrderItemLine,
  Product,
  ProductImage,
  ProductVariant,
  User,
  Warehouse,
} from "./types";

// Talks to the Laravel API described in API.md. Server Components call these
// directly (Node fetch, no CORS involved); a "use client" component would
// need NEXT_PUBLIC_API_URL to also be reachable from the browser.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api/v1";

interface ApiCollection<T> {
  data: T[];
}

interface ApiResource<T> {
  data: T;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API ${path} -> ${res.status}`);
  }
  return res.json();
}

// Laravel's 422 validation shape (API.md §1): {"message": "...", "errors": {"field": ["..."]}}.
// Business-rule errors (wrong credentials, suspended account) come through
// the same shape as a single-field `errors` entry, already in French.
export class ApiValidationError extends Error {
  errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiValidationError";
    this.errors = errors;
  }
}

async function postAuth(path: string, payload: object): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiValidationError(body?.message ?? `API ${path} -> ${res.status}`, body?.errors ?? {});
  }

  return res.json();
}

export async function login(phone: string, password: string, deviceName?: string): Promise<AuthResponse> {
  return postAuth("/login", { phone, password, device_name: deviceName });
}

export async function register(
  name: string,
  phone: string,
  password: string,
  passwordConfirmation: string
): Promise<AuthResponse> {
  return postAuth("/register", {
    name,
    phone,
    password,
    password_confirmation: passwordConfirmation,
  });
}

// Best-effort: revokes the token server-side. Called on logout alongside
// clearing the local session — if it fails (offline, expired token), the
// local session is cleared anyway, so it's not worth surfacing an error for.
export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

// Called on Profile mount to confirm the stored token is still valid and to
// refresh the user's data (API.md: "pratique pour vérifier au démarrage de
// l'app si le token stocké est encore valide"). Throws on 401 (revoked,
// expired, or the account was suspended) so the caller can clear the stale
// local session.
export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API /me -> ${res.status}`);
  }

  const { data } = await res.json();
  return data;
}

// Laravel returns `decimal` columns as strings (e.g. "20000.00") to avoid
// float precision loss — coerce them here so the rest of the app can treat
// Product/ProductVariant prices as the `number` the types declare.
function normalizeImage(raw: ProductImage): ProductImage {
  return raw;
}

function normalizeVariant(raw: ProductVariant): ProductVariant {
  return {
    ...raw,
    additional_price: Number(raw.additional_price),
    images: (raw.images ?? []).map(normalizeImage),
  };
}

function normalizeProduct(raw: Product): Product {
  return {
    ...raw,
    base_price: Number(raw.base_price),
    promo_price: raw.promo_price !== null ? Number(raw.promo_price) : null,
    price: Number(raw.price),
    images: raw.images ?? [],
    variants: (raw.variants ?? []).map(normalizeVariant),
  };
}

function normalizeCategory(raw: Category): Category {
  return {
    ...raw,
    children: (raw.children ?? []).map(normalizeCategory),
  };
}

// `/categories` only returns active root categories, with their subcategories
// nested under `children` (see API.md §3). None of the category lists in this
// app render a hierarchy — they're flat bubble/sidebar lists — so flatten the
// tree here to surface every category (root and child) from the database.
function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children)]);
}

export interface GetProductsParams {
  category_id?: number;
  brand_id?: number;
  q?: string;
  is_promotion?: boolean;
  min_price?: number;
  max_price?: number;
  sort_by?: "created_at" | "base_price" | "name";
  sort_dir?: "asc" | "desc";
  per_page?: number;
}

function buildQuery(params: GetProductsParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function getProducts(params: GetProductsParams = {}): Promise<Product[]> {
  const { data } = await apiFetch<ApiCollection<Product>>(`/products${buildQuery(params)}`);
  return data.map(normalizeProduct);
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await apiFetch<ApiResource<Product>>(`/products/${id}`);
  return normalizeProduct(data);
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiFetch<ApiCollection<Category>>("/categories");
  return flattenCategories(data.map(normalizeCategory));
}

export async function getBrands(): Promise<Brand[]> {
  const { data } = await apiFetch<ApiCollection<Brand>>("/brands");
  return data;
}

function normalizeNeighborhood(raw: Neighborhood): Neighborhood {
  return {
    ...raw,
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
  };
}

export async function getCities(): Promise<City[]> {
  const { data } = await apiFetch<ApiCollection<City>>("/cities");
  return data;
}

export async function getNeighborhoods(cityId?: number): Promise<Neighborhood[]> {
  const query = cityId !== undefined ? `?city_id=${cityId}` : "";
  const { data } = await apiFetch<ApiCollection<Neighborhood>>(`/neighborhoods${query}`);
  return data.map(normalizeNeighborhood);
}

export async function getDeliveryEstimate(
  neighborhoodId: number,
  itemCount = 1
): Promise<DeliveryEstimate> {
  return apiFetch<DeliveryEstimate>(
    `/delivery/estimate?neighborhood_id=${neighborhoodId}&item_count=${itemCount}`
  );
}

// Cart routes all require auth (API.md §4) — each call takes the Bearer
// token explicitly rather than reading it from storage here, so this module
// stays free of any localStorage/session dependency (lib/auth.ts owns that).
async function authedFetch<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiValidationError(body?.message ?? `API ${path} -> ${res.status}`, body?.errors ?? {});
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function normalizeCartItem(raw: CartItemLine): CartItemLine {
  return {
    ...raw,
    product: normalizeProduct(raw.product),
    variant: raw.variant ? normalizeVariant(raw.variant) : null,
  };
}

function normalizeCart(raw: Cart): Cart {
  return { ...raw, items: raw.items.map(normalizeCartItem) };
}

export async function getCart(token: string): Promise<Cart> {
  const { data } = await authedFetch<ApiResource<Cart>>("/cart", token);
  return normalizeCart(data);
}

export async function addCartItem(
  token: string,
  productId: number,
  quantity: number,
  variantId?: number
): Promise<Cart> {
  const { data } = await authedFetch<ApiResource<Cart>>("/cart/items", token, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, product_variant_id: variantId, quantity }),
  });
  return normalizeCart(data);
}

export async function updateCartItem(token: string, cartItemId: number, quantity: number): Promise<Cart> {
  const { data } = await authedFetch<ApiResource<Cart>>(`/cart/items/${cartItemId}`, token, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
  return normalizeCart(data);
}

export async function removeCartItem(token: string, cartItemId: number): Promise<void> {
  await authedFetch<void>(`/cart/items/${cartItemId}`, token, { method: "DELETE" });
}

export async function clearCart(token: string): Promise<void> {
  await authedFetch<void>("/cart", token, { method: "DELETE" });
}

function normalizeWarehouse(raw: Warehouse): Warehouse {
  return { ...raw, latitude: Number(raw.latitude), longitude: Number(raw.longitude) };
}

export async function getWarehouses(): Promise<Warehouse[]> {
  const { data } = await apiFetch<ApiCollection<Warehouse>>("/warehouses");
  return data.map(normalizeWarehouse);
}

function normalizeOrderItem(raw: OrderItemLine): OrderItemLine {
  return {
    ...raw,
    product: normalizeProduct(raw.product),
    variant: raw.variant ? normalizeVariant(raw.variant) : null,
    unit_price: Number(raw.unit_price),
  };
}

// total_amount/discount_amount/delivery_fees/shipping_lat+long/payment.amount
// are raw `decimal` Eloquent attributes (strings), unlike Cart's, whose
// totals are PHP-computed at request time and already come through as
// numbers — see OrderResource/PaymentResource vs CartResource.
function normalizeOrder(raw: Order): Order {
  return {
    ...raw,
    total_amount: Number(raw.total_amount),
    discount_amount: Number(raw.discount_amount),
    delivery_fees: Number(raw.delivery_fees),
    shipping_latitude: raw.shipping_latitude !== null ? Number(raw.shipping_latitude) : null,
    shipping_longitude: raw.shipping_longitude !== null ? Number(raw.shipping_longitude) : null,
    warehouse: raw.warehouse ? normalizeWarehouse(raw.warehouse) : null,
    items: raw.items.map(normalizeOrderItem),
    payment: { ...raw.payment, amount: Number(raw.payment.amount) },
  };
}

// Shared shape for both delivery_method branches (API.md §6) — the fields
// that don't apply to the chosen branch are simply omitted, not sent as
// null/undefined keys.
export type CheckoutPayload =
  | {
      delivery_method: "livraison";
      shipping_address: string;
      shipping_phone: string;
      shipping_latitude: number;
      shipping_longitude: number;
      payment_method: ApiPaymentMethod;
      coupon_code?: string;
    }
  | {
      delivery_method: "retrait";
      warehouse_id: number;
      shipping_phone: string;
      payment_method: ApiPaymentMethod;
      coupon_code?: string;
    };

export async function placeOrder(token: string, payload: CheckoutPayload): Promise<Order> {
  const { data } = await authedFetch<ApiResource<Order>>("/checkout", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeOrder(data);
}
