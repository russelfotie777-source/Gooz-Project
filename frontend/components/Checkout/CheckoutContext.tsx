"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiValidationError,
  type CheckoutPayload,
  getAddresses,
  getCart,
  getCities,
  getDeliveryEstimate,
  getNeighborhoods,
  getWarehouses,
  isUnauthorized,
  placeOrder as apiPlaceOrder,
  validateCoupon as apiValidateCoupon,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import { persistCouponCode, readPersistedCouponCode } from "@/lib/coupon";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { splitName } from "@/lib/name";
import { showToast } from "@/lib/toast";
import type { Address, ApiPaymentMethod, CartItemLine, City, Neighborhood, Warehouse } from "@/lib/types";

// Loose match on purpose: Address.ville/quartier are free text (the
// Adresses page has its own form, unconnected to the City/Neighborhood
// lookup tables checkout needs for delivery-fee pricing — see
// applySavedAddress below), so "Douala" and "douala " need to match the
// same City even though they're not byte-identical.
function normalizeForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

export interface CheckoutFormData {
  nom: string;
  prenom: string;
  telephone: string;
  whatsapp: string;
  email: string;
  adresse: string;
  cityId: string;
  neighborhoodId: string;
}

export type DeliveryMethod = "domicile" | "agence";
export type PaymentMethod = "cash" | "online";
export type CartStatus = "loading" | "loggedOut" | "empty" | "ready" | "error";

const EMPTY_FORM: CheckoutFormData = {
  nom: "",
  prenom: "",
  telephone: "",
  whatsapp: "",
  email: "",
  adresse: "",
  cityId: "",
  neighborhoodId: "",
};

interface CheckoutContextValue {
  cartStatus: CartStatus;
  /** Re-runs the initial cart/cities/neighborhoods/warehouses load — for the retry button when cartStatus is "error". */
  retryLoad: () => void;
  items: CartItemLine[];
  subtotal: number;
  cities: City[];
  neighborhoods: Neighborhood[];
  warehouse: Warehouse | null;
  form: CheckoutFormData;
  setForm: (patch: Partial<CheckoutFormData>) => void;
  /** The shopper's saved address book (/adresses) — the default one (or the
   *  first, if none is marked default) is applied automatically once on
   *  load; this list lets the UI offer the others too. Empty for a
   *  first-time buyer, same as before this existed. */
  savedAddresses: Address[];
  /** Fills form from one of savedAddresses — ville/quartier are matched by
   *  name against cities/neighborhoods (see normalizeForMatch); a saved
   *  address whose city/quartier text doesn't match any known one still
   *  fills the rest (name/phone/street), just not those two selects. */
  applySavedAddress: (addressId: number) => void;
  isAddressComplete: boolean;
  deliveryMethod: DeliveryMethod | null;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  deliveryFee: number;
  deliveryStatus: "idle" | "loading" | "error";
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (method: PaymentMethod) => void;
  coupon: string;
  setCoupon: (value: string) => void;
  couponStatus: "idle" | "checking" | "applied" | "invalid";
  couponError: string | null;
  discountAmount: number;
  applyCoupon: () => Promise<void>;
  total: number;
  orderNumber: string | null;
  /** Enkap's hosted payment page — set only for "online" orders once created. */
  checkoutUrl: string | null;
  placeOrder: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

// The confirmation screen (mobile route + desktop inline view) reads
// orderNumber straight from this context. Without this, a refresh on the
// confirmation screen — a completely ordinary thing to do right after
// paying — wipes the in-memory state and bounces the customer back to the
// address step, even though the order is already sitting in the database.
const LAST_ORDER_STORAGE_KEY = "shopitech-last-order";

function readPersistedOrderNumber(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistOrderNumber(reference: string): void {
  try {
    window.sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, reference);
  } catch {
    // Best-effort only — losing this doesn't break anything beyond
    // reintroducing the refresh bug this exists to fix.
  }
}

// Real cart + real /checkout (API.md §6), gated on the same auth the cart
// itself requires — see cartStatus. The address form maps onto the API's
// richer shape at submit time: the free-text "adresse" field is combined
// with the selected quartier/ville into `shipping_address`, and the
// quartier's own stored lat/lng (already fetched for the delivery-fee
// preview) doubles as `shipping_latitude`/`shipping_longitude` since there's
// no map-pin/geolocation picker in this UI.
export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const dict = useDictionary();
  const [cartStatus, setCartStatus] = useState<CartStatus>("loading");
  const [items, setItems] = useState<CartItemLine[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [form, setFormState] = useState<CheckoutFormData>(EMPTY_FORM);
  const [deliveryMethod, setDeliveryMethodState] = useState<DeliveryMethod | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  // Prefilled from whatever the customer already applied on the cart page
  // (see lib/coupon.ts) — without this, a coupon validated in the cart
  // would silently vanish by the time checkout loads.
  // Both start empty/null rather than reading sessionStorage synchronously:
  // this component is server-rendered too, where sessionStorage doesn't
  // exist, so seeding the initial state from it here would make the very
  // first client render disagree with the server-rendered HTML (hydration
  // mismatch). Rehydrated from storage in the mount effect below instead,
  // once we're definitely client-side.
  const [coupon, setCouponState] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "applied" | "invalid">("idle");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  function loadCart() {
    const session = getSession();
    if (!session) {
      setCartStatus("loggedOut");
      return;
    }

    setCartStatus("loading");

    // Prefill from the logged-in user's own profile. Only runs once on
    // mount, so it never clobbers anything the shopper has since typed.
    const { prenom, nom } = splitName(session.user.name);
    setForm({ prenom, nom, telephone: session.user.phone ?? "" });

    Promise.all([
      getCart(session.token),
      getCities(),
      getNeighborhoods(),
      getWarehouses(),
      getAddresses(session.token),
    ])
      .then(([cart, citiesData, neighborhoodsData, warehousesData, addressesData]) => {
        setItems(cart.items);
        setCities(citiesData);
        setNeighborhoods(neighborhoodsData);
        setWarehouse(warehousesData.find((w) => w.is_active) ?? warehousesData[0] ?? null);
        setSavedAddresses(addressesData);
        setCartStatus(cart.items.length === 0 ? "empty" : "ready");

        // Only on this first load, before the shopper has had a chance to
        // type anything — applyAddressFields below is also reachable later
        // (applySavedAddress) to switch to a different saved address.
        const defaultAddress = addressesData.find((a) => a.is_default) ?? addressesData[0] ?? null;
        if (defaultAddress) applyAddressFields(defaultAddress, citiesData, neighborhoodsData);
      })
      // Of these five calls, only getCart and getAddresses are
      // authenticated (same token either way) — so a 401 here can only mean
      // the session really is dead. Anything else (offline, the backend
      // being down, a 500 from any of the public endpoints) is a technical
      // failure, not a logged-out shopper, and shouldn't be treated like
      // one mid-checkout.
      .catch((err) => setCartStatus(isUnauthorized(err) ? "loggedOut" : "error"));
  }

  // loadCart calls applyAddressFields, a plain function (not useCallback)
  // redeclared every render — exhaustive-deps wants it listed, but it only
  // reads its own params, never anything from this render's closure, so
  // there's nothing to actually go stale. Run-once-on-mount is the intent
  // either way.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadCart, []);

  useEffect(() => {
    const persistedOrder = readPersistedOrderNumber();
    if (persistedOrder) setOrderNumber(persistedOrder);
    const persistedCoupon = readPersistedCouponCode();
    if (persistedCoupon) setCouponState(persistedCoupon);
  }, []);

  function setForm(patch: Partial<CheckoutFormData>) {
    setFormState((current) => ({ ...current, ...patch }));
  }

  function applyAddressFields(address: Address, citiesList: City[], neighborhoodsList: Neighborhood[]) {
    const { prenom, nom } = splitName(address.recipient_name);
    const city = citiesList.find((c) => normalizeForMatch(c.name) === normalizeForMatch(address.ville));
    const neighborhood =
      city && address.quartier
        ? neighborhoodsList.find(
            (n) => n.city_id === city.id && normalizeForMatch(n.name) === normalizeForMatch(address.quartier!)
          )
        : undefined;

    setForm({
      nom,
      prenom,
      telephone: address.recipient_phone,
      adresse: address.address_line ?? "",
      cityId: city ? String(city.id) : "",
      neighborhoodId: neighborhood ? String(neighborhood.id) : "",
    });
  }

  function applySavedAddress(addressId: number) {
    const address = savedAddresses.find((a) => a.id === addressId);
    if (address) applyAddressFields(address, cities, neighborhoods);
  }

  function setDeliveryMethod(method: DeliveryMethod) {
    setDeliveryMethodState(method);

    if (method === "agence") {
      setDeliveryFee(0);
      setDeliveryStatus("idle");
      return;
    }

    if (!form.neighborhoodId) {
      setDeliveryFee(0);
      setDeliveryStatus("idle");
      return;
    }

    setDeliveryStatus("loading");
    getDeliveryEstimate(Number(form.neighborhoodId))
      .then((estimate) => {
        setDeliveryFee(estimate.delivery_fee);
        setDeliveryStatus("idle");
      })
      .catch(() => {
        setDeliveryFee(0);
        setDeliveryStatus("error");
      });
  }

  function setCoupon(value: string) {
    setCouponState(value);
    // Editing the code after a successful/failed check invalidates whatever
    // that check found — otherwise a stale discount (or a stale error)
    // could stick around next to a code that no longer matches it.
    setCouponStatus("idle");
    setCouponError(null);
    setDiscountAmount(0);
  }

  async function applyCoupon(): Promise<void> {
    const session = getSession();
    const trimmed = coupon.trim();
    if (!session || !trimmed) return;

    setCouponStatus("checking");
    setCouponError(null);

    try {
      const result = await apiValidateCoupon(session.token, trimmed, subtotal);
      setDiscountAmount(result.discount_amount);
      setCouponStatus("applied");
      persistCouponCode(trimmed);
    } catch (err) {
      setDiscountAmount(0);
      setCouponStatus("invalid");
      setCouponError(
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.checkout.genericOrderError
      );
    }
  }

  async function placeOrder(): Promise<void> {
    const session = getSession();
    if (!session) return;

    // A missing delivery/payment method here means a step was skipped (see
    // the redirect guards in CheckoutDeliveryStep/CheckoutPaymentStep) —
    // returning silently used to leave the "Envoi..." button stuck forever
    // with no explanation once someone reached this state.
    if (!deliveryMethod || !paymentMethod) {
      showToast(dict.checkout.genericOrderError, "error");
      throw new Error("placeOrder called with an incomplete checkout state");
    }

    const apiPaymentMethod: ApiPaymentMethod = paymentMethod === "cash" ? "espèces" : "mobile_money";

    try {
      let payload: CheckoutPayload;

      if (deliveryMethod === "domicile") {
        const neighborhood = neighborhoods.find((n) => String(n.id) === form.neighborhoodId);
        const city = cities.find((c) => String(c.id) === form.cityId);
        if (!neighborhood) throw new Error(dict.checkout.invalidNeighborhood);

        payload = {
          delivery_method: "livraison",
          shipping_address: [form.adresse, neighborhood.name, city?.name].filter(Boolean).join(", "),
          shipping_phone: form.telephone,
          shipping_latitude: neighborhood.latitude,
          shipping_longitude: neighborhood.longitude,
          payment_method: apiPaymentMethod,
          ...(coupon.trim() ? { coupon_code: coupon.trim() } : {}),
        };
      } else {
        if (!warehouse) throw new Error(dict.checkout.noPickupPoint);

        payload = {
          delivery_method: "retrait",
          warehouse_id: warehouse.id,
          shipping_phone: form.telephone,
          payment_method: apiPaymentMethod,
          ...(coupon.trim() ? { coupon_code: coupon.trim() } : {}),
        };
      }

      const order = await apiPlaceOrder(session.token, payload);
      setOrderNumber(order.order_reference);
      persistOrderNumber(order.order_reference);
      setCheckoutUrl(order.payment.checkout_url);
      // The backend deactivates the cart on a successful checkout (API.md
      // §6) — a fresh empty one is created lazily on the next add — so the
      // header badge should reset to 0 rather than wait for its own refetch.
      notifyCartUpdated(0);
    } catch (err) {
      if (err instanceof ApiValidationError) {
        showToast(Object.values(err.errors)[0]?.[0] ?? err.message, "error");
      } else {
        // Not a validation error the backend anticipated (network failure,
        // a bug in the payload above, ...) — worth a console trace since
        // the user-facing message is necessarily generic here.
        console.error("placeOrder failed unexpectedly", err);
        showToast(dict.checkout.genericOrderError, "error");
      }
      throw err;
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const total = Math.max(0, subtotal - discountAmount) + (deliveryMethod === "domicile" ? deliveryFee : 0);

  const isAddressComplete = Boolean(
    form.nom.trim() &&
      form.prenom.trim() &&
      form.telephone.trim() &&
      form.adresse.trim() &&
      form.cityId &&
      form.neighborhoodId
  );

  const value = useMemo<CheckoutContextValue>(
    () => ({
      cartStatus,
      retryLoad: loadCart,
      items,
      subtotal,
      cities,
      neighborhoods,
      warehouse,
      savedAddresses,
      applySavedAddress,
      form,
      setForm,
      isAddressComplete,
      deliveryMethod,
      setDeliveryMethod,
      deliveryFee,
      deliveryStatus,
      paymentMethod,
      setPaymentMethod,
      coupon,
      setCoupon,
      couponStatus,
      couponError,
      discountAmount,
      applyCoupon,
      total,
      orderNumber,
      checkoutUrl,
      placeOrder,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cartStatus,
      items,
      subtotal,
      cities,
      neighborhoods,
      warehouse,
      savedAddresses,
      form,
      isAddressComplete,
      deliveryMethod,
      deliveryFee,
      deliveryStatus,
      paymentMethod,
      coupon,
      couponStatus,
      couponError,
      discountAmount,
      total,
      orderNumber,
      checkoutUrl,
    ]
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return ctx;
}
