import type {
  Address,
  ApiPaymentMethod,
  AppNotification,
  AuthResponse,
  Banner,
  Brand,
  Cart,
  CartItemLine,
  Category,
  City,
  DeliveryEstimate,
  HomepageSection,
  Neighborhood,
  Order,
  OrderItemLine,
  Product,
  ProductImage,
  ProductVariant,
  Ticket,
  TicketPriority,
  User,
  Warehouse,
} from "./types";
import { notifySessionExpired } from "./sessionEvents";

// Talks to the Laravel API described in API.md. Server Components call these
// directly (Node fetch, no CORS involved); a "use client" component would
// need NEXT_PUBLIC_API_URL to also be reachable from the browser.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api/v1";

// File uploads (banner images, ...) come back as a path relative to the
// Laravel app's own origin (e.g. "/storage/banners/x.jpg"), not the "/api/v1"
// API root — resolve it against the API origin so it's a real loadable URL.
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export function resolveMediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

interface ApiCollection<T> {
  data: T[];
}

interface ApiResource<T> {
  data: T;
}

// Laravel's 422 validation shape (API.md §1): {"message": "...", "errors": {"field": ["..."]}}.
// Business-rule errors (wrong credentials, suspended account) come through
// the same shape as a single-field `errors` entry, already in French.
//
// `status` is what lets a caller tell "the server said no" (401: really not
// authenticated) apart from "we couldn't reach the server at all" (network
// failure — status undefined) or "the server broke" (5xx) — see
// isUnauthorized()/isNetworkFailure() below. Before this field existed,
// every failure mode collapsed into the same catch block, so a offline
// blip during checkout looked identical to a revoked session.
export class ApiValidationError extends Error {
  errors: Record<string, string[]>;

  status?: number;

  constructor(message: string, errors: Record<string, string[]> = {}, status?: number) {
    super(message);
    this.name = "ApiValidationError";
    this.errors = errors;
    this.status = status;
  }
}

/** True only for a real 401 response — the one case where "please log in again" is the correct UI. */
export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiValidationError && error.status === 401;
}

/** True when the request never got a response at all (offline, DNS failure, backend down mid-request). */
export function isNetworkFailure(error: unknown): boolean {
  return error instanceof ApiValidationError && error.status === undefined;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetchOrThrow(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new ApiValidationError(`API ${path} -> ${res.status}`, {}, res.status);
  }
  return res.json();
}

// Wraps fetch() itself so a network-level failure (offline, DNS, connection
// refused — fetch() rejecting before any response exists) surfaces as the
// same ApiValidationError type as an HTTP error response, just with
// `status` left undefined instead of set. Every caller in this file goes
// through this instead of a bare `fetch()` so isNetworkFailure() works
// everywhere, not just on the endpoints someone remembered to wrap.
async function fetchOrThrow(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed";
    throw new ApiValidationError(message, {}, undefined);
  }
}

async function postAuth(path: string, payload: object): Promise<AuthResponse> {
  const res = await fetchOrThrow(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiValidationError(body?.message ?? `API ${path} -> ${res.status}`, body?.errors ?? {}, res.status);
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

// Backend verifies the Firebase ID token itself (App\Services\
// FirebaseIdTokenVerifier) — this call never carries a provider secret, only
// the token Firebase's own popup flow already produced client-side.
export async function socialLogin(idToken: string, deviceName?: string): Promise<AuthResponse> {
  return postAuth("/auth/social", { id_token: idToken, device_name: deviceName });
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
  const { data } = await authedFetch<ApiResource<User>>("/me", token);
  return data;
}

export type ProfilePayload = {
  name: string;
  phone: string;
};

export async function updateProfile(token: string, payload: ProfilePayload): Promise<User> {
  const { data } = await authedFetch<ApiResource<User>>("/me", token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data;
}

// Irreversible: anonymizes the account server-side and revokes every token
// (see AuthController::destroy) — requires the current password as a final
// identity check, so a stolen/left-open session alone can't trigger it.
// Goes through authedFetch like every other authenticated call so a real
// 401 here is recognized by isUnauthorized() (and triggers the same global
// session-expired handling) instead of being indistinguishable from a wrong
// password or a network failure — the raw fetch() this used to use built its
// ApiValidationError without a status at all.
export async function deleteAccount(token: string, password: string): Promise<void> {
  await authedFetch<void>("/me", token, {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
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
    base_price: Number(raw.base_price),
    promo_price: raw.promo_price !== null ? Number(raw.promo_price) : null,
    price: Number(raw.price),
    cost_price: raw.cost_price !== null ? Number(raw.cost_price) : null,
    tax_rate: raw.tax_rate !== null ? Number(raw.tax_rate) : null,
    images: (raw.images ?? []).map(normalizeImage),
  };
}

function normalizeProduct(raw: Product): Product {
  return {
    ...raw,
    price_from: raw.price_from !== null && raw.price_from !== undefined ? Number(raw.price_from) : null,
    images: raw.images ?? [],
    variants: (raw.variants ?? []).map(normalizeVariant),
  };
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

// Matches ProductController's own hard cap — the homepage catalogue and
// category pages fetch once and filter/sort client-side rather than
// re-querying per filter change, so this is also the point past which a
// filter can silently under-report matches (see CatalogueSection/
// CategoryResults' truncation notice). A real server-driven paginated
// catalogue is the actual fix once the product count grows enough to matter.
export const PRODUCT_FETCH_CAP = 200;

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
  return data;
}

export async function getBrands(): Promise<Brand[]> {
  const { data } = await apiFetch<ApiCollection<Brand>>("/brands");
  return data;
}

export async function getBanners(location?: Banner["location"]): Promise<Banner[]> {
  const query = location ? `?location=${location}` : "";
  const { data } = await apiFetch<ApiCollection<Banner>>(`/banners${query}`);
  return data;
}

// Admin-configured homepage sections (Admin\HomepageSectionController) —
// resolved server-side (manual picks or an automatic strategy) into
// products/categories/brands, see HomepageSectionController::present().
export async function getHomepageSections(): Promise<HomepageSection[]> {
  const { data } = await apiFetch<ApiCollection<HomepageSection>>("/homepage-sections");
  return data.map((section) =>
    section.content_type === "products" ? { ...section, products: section.products.map(normalizeProduct) } : section
  );
}

export async function subscribeNewsletter(email: string): Promise<void> {
  const res = await fetchOrThrow(`${API_BASE_URL}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiValidationError(body?.message ?? `API /newsletter/subscribe -> ${res.status}`, body?.errors ?? {}, res.status);
  }
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
  const res = await fetchOrThrow(`${API_BASE_URL}${path}`, {
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
    // A 401 on an authenticated call means the token itself is dead — not
    // something any individual caller should have to notice and react to on
    // its own (previously most just .catch(() => {})'d it, leaving the UI
    // looking logged-in while every authenticated action silently failed).
    // Centralized here since every authenticated request goes through this
    // one function.
    if (res.status === 401) notifySessionExpired();
    const body = await res.json().catch(() => null);
    throw new ApiValidationError(body?.message ?? `API ${path} -> ${res.status}`, body?.errors ?? {}, res.status);
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

export interface CouponPreview {
  code: string;
  discount_amount: number;
}

// Preview-only: applies the exact same Coupon::isValidFor()/calculateDiscount()
// logic the real /checkout endpoint uses, so this can never promise a
// discount checkout wouldn't also grant. Throws ApiValidationError (422)
// with an `errors.code` message when the coupon is invalid/expired/unmet.
export async function validateCoupon(token: string, code: string, subtotal: number): Promise<CouponPreview> {
  return authedFetch<CouponPreview>("/coupons/validate", token, {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });
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

export async function getOrders(token: string): Promise<Order[]> {
  const { data } = await authedFetch<ApiCollection<Order>>("/orders", token);
  return data.map(normalizeOrder);
}

export async function getOrder(token: string, orderId: number): Promise<Order> {
  const { data } = await authedFetch<ApiResource<Order>>(`/orders/${orderId}`, token);
  return normalizeOrder(data);
}

// Looks an order up by its reference (not its numeric id) and 403s if it
// doesn't belong to the caller — used by the checkout confirmation screen to
// verify the reference from the URL is real before showing a "your order is
// confirmed" screen for it (see CheckoutConfirmationStep).
export async function getOrderByReference(token: string, reference: string): Promise<Order> {
  const { data } = await authedFetch<ApiResource<Order>>(`/orders/reference/${encodeURIComponent(reference)}`, token);
  return normalizeOrder(data);
}

// Re-checks a mobile-money order's payment status with Enkap (or retries
// creating the Enkap order if that step failed during checkout). Called
// from the payment-return page the customer lands back on after Enkap.
export async function refreshOrderPayment(token: string, orderReference: string): Promise<Order> {
  const { data } = await authedFetch<ApiResource<Order>>(
    `/orders/${orderReference}/payment/refresh`,
    token,
    { method: "POST" }
  );
  return normalizeOrder(data);
}

export type AddressPayload = {
  label?: string | null;
  recipient_name: string;
  recipient_phone: string;
  country?: string;
  region?: string | null;
  ville: string;
  quartier?: string | null;
  address_line?: string | null;
  postal_code?: string | null;
  is_default?: boolean;
};

export async function getAddresses(token: string): Promise<Address[]> {
  const { data } = await authedFetch<ApiCollection<Address>>("/addresses", token);
  return data;
}

export async function createAddress(token: string, payload: AddressPayload): Promise<Address> {
  const { data } = await authedFetch<ApiResource<Address>>("/addresses", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function updateAddress(
  token: string,
  addressId: number,
  payload: Partial<AddressPayload>
): Promise<Address> {
  const { data } = await authedFetch<ApiResource<Address>>(`/addresses/${addressId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function deleteAddress(token: string, addressId: number): Promise<void> {
  await authedFetch<void>(`/addresses/${addressId}`, token, { method: "DELETE" });
}

export type TicketPayload = {
  subject: string;
  category: string;
  priority: TicketPriority;
  message?: string | null;
};

export async function getMyTickets(token: string): Promise<Ticket[]> {
  const { data } = await authedFetch<ApiCollection<Ticket>>("/tickets", token);
  return data;
}

export async function createTicket(token: string, payload: TicketPayload): Promise<Ticket> {
  const { data } = await authedFetch<ApiResource<Ticket>>("/tickets", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export type DevicePlatform = "android" | "ios" | "web";

export async function registerDeviceToken(
  token: string,
  deviceToken: string,
  platform: DevicePlatform
): Promise<void> {
  await authedFetch<void>("/device-tokens", token, {
    method: "POST",
    body: JSON.stringify({ token: deviceToken, platform }),
  });
}

export async function unregisterDeviceToken(token: string, deviceToken: string): Promise<void> {
  await authedFetch<void>("/device-tokens", token, {
    method: "DELETE",
    body: JSON.stringify({ token: deviceToken }),
  });
}

// In-app notification inbox — distinct from the device-token push system
// above (that one's for waking a closed app; this one's the persisted,
// readable "Tout"/"Non lu" list).
export async function getNotifications(token: string, unreadOnly = false): Promise<AppNotification[]> {
  const query = unreadOnly ? "?unread=1" : "";
  const { data } = await authedFetch<ApiCollection<AppNotification>>(`/notifications${query}`, token);
  return data;
}

export async function markNotificationRead(token: string, id: number): Promise<AppNotification> {
  const { data } = await authedFetch<ApiResource<AppNotification>>(`/notifications/${id}/read`, token, {
    method: "POST",
  });
  return data;
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await authedFetch<void>("/notifications/read-all", token, { method: "POST" });
}
