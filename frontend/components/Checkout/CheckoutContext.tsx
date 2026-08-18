"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiValidationError,
  type CheckoutPayload,
  getCart,
  getCities,
  getDeliveryEstimate,
  getNeighborhoods,
  getWarehouses,
  placeOrder as apiPlaceOrder,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notifyCartUpdated } from "@/lib/cartEvents";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { splitName } from "@/lib/name";
import type { ApiPaymentMethod, CartItemLine, City, Neighborhood, Warehouse } from "@/lib/types";

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
export type CartStatus = "loading" | "loggedOut" | "empty" | "ready";

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
  items: CartItemLine[];
  subtotal: number;
  cities: City[];
  neighborhoods: Neighborhood[];
  warehouse: Warehouse | null;
  form: CheckoutFormData;
  setForm: (patch: Partial<CheckoutFormData>) => void;
  isAddressComplete: boolean;
  deliveryMethod: DeliveryMethod | null;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  deliveryFee: number;
  deliveryStatus: "idle" | "loading" | "error";
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (method: PaymentMethod) => void;
  coupon: string;
  setCoupon: (value: string) => void;
  total: number;
  orderNumber: string | null;
  /** Enkap's hosted payment page — set only for "online" orders once created. */
  checkoutUrl: string | null;
  checkoutError: string | null;
  placeOrder: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

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
  const [form, setFormState] = useState<CheckoutFormData>(EMPTY_FORM);
  const [deliveryMethod, setDeliveryMethodState] = useState<DeliveryMethod | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [coupon, setCoupon] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setCartStatus("loggedOut");
      return;
    }

    // Prefill from the logged-in user's own profile. Only runs once on
    // mount, so it never clobbers anything the shopper has since typed.
    const { prenom, nom } = splitName(session.user.name);
    setForm({ prenom, nom, telephone: session.user.phone });

    Promise.all([getCart(session.token), getCities(), getNeighborhoods(), getWarehouses()])
      .then(([cart, citiesData, neighborhoodsData, warehousesData]) => {
        setItems(cart.items);
        setCities(citiesData);
        setNeighborhoods(neighborhoodsData);
        setWarehouse(warehousesData.find((w) => w.is_active) ?? warehousesData[0] ?? null);
        setCartStatus(cart.items.length === 0 ? "empty" : "ready");
      })
      .catch(() => setCartStatus("loggedOut"));
  }, []);

  function setForm(patch: Partial<CheckoutFormData>) {
    setFormState((current) => ({ ...current, ...patch }));
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

  async function placeOrder(): Promise<void> {
    const session = getSession();
    if (!session || !deliveryMethod || !paymentMethod) return;

    setCheckoutError(null);
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
      setCheckoutUrl(order.payment.checkout_url);
      // The backend deactivates the cart on a successful checkout (API.md
      // §6) — a fresh empty one is created lazily on the next add — so the
      // header badge should reset to 0 rather than wait for its own refetch.
      notifyCartUpdated(0);
    } catch (err) {
      setCheckoutError(
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.checkout.genericOrderError
      );
      throw err;
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const total = subtotal + (deliveryMethod === "domicile" ? deliveryFee : 0);

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
      items,
      subtotal,
      cities,
      neighborhoods,
      warehouse,
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
      total,
      orderNumber,
      checkoutUrl,
      checkoutError,
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
      form,
      isAddressComplete,
      deliveryMethod,
      deliveryFee,
      deliveryStatus,
      paymentMethod,
      coupon,
      total,
      orderNumber,
      checkoutUrl,
      checkoutError,
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
