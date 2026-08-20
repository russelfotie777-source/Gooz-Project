import type { ApiDeliveryMethod, ApiPaymentMethod, Order, OrderStatus, PaymentStatus } from "@/lib/types";

// Shared label-key lookups so OrderHistoryPage (mobile) and
// OrderHistoryDesktop render identical wording — dict.orders is authoritative,
// this file just maps the API's raw enum values to the right dictionary key.
export const ORDER_STATUS_LABEL_KEYS: Record<
  OrderStatus,
  "statusPending" | "statusConfirmed" | "statusPreparing" | "statusShipped" | "statusDelivered" | "statusCancelled"
> = {
  en_attente: "statusPending",
  confirmée: "statusConfirmed",
  en_préparation: "statusPreparing",
  expédiée: "statusShipped",
  livrée: "statusDelivered",
  annulée: "statusCancelled",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  en_attente: "statusPending",
  confirmée: "statusConfirmed",
  en_préparation: "statusPreparing",
  expédiée: "statusShipped",
  livrée: "statusDelivered",
  annulée: "statusCancelled",
};

export const PAYMENT_METHOD_LABEL_KEYS: Record<ApiPaymentMethod, "paymentCard" | "paymentMobileMoney" | "paymentPaypal" | "paymentCash"> = {
  carte: "paymentCard",
  mobile_money: "paymentMobileMoney",
  paypal: "paymentPaypal",
  espèces: "paymentCash",
};

export const PAYMENT_STATUS_LABEL_KEYS: Record<
  PaymentStatus,
  "paymentStatusPending" | "paymentStatusPaid" | "paymentStatusFailed" | "paymentStatusRefunded"
> = {
  en_attente: "paymentStatusPending",
  payé: "paymentStatusPaid",
  échoué: "paymentStatusFailed",
  remboursé: "paymentStatusRefunded",
};

// Reuses OrderHistoryPage's statusBadge color classes — visually consistent
// with the order-status badges shown right next to it in the payment
// history view, without inventing a second badge palette.
export const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  en_attente: "statusPending",
  payé: "statusDelivered",
  échoué: "statusCancelled",
  remboursé: "statusPreparing",
};

export const DELIVERY_METHOD_LABEL_KEYS: Record<ApiDeliveryMethod, "deliveryMethodHome" | "deliveryMethodPickup"> = {
  livraison: "deliveryMethodHome",
  retrait: "deliveryMethodPickup",
};

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

// Reconstructed client-side from three separate API values — normalizeOrder
// (lib/api.ts) already coerces them to numbers, but a malformed/unexpected
// response could still produce NaN or (in principle) a negative result here.
// Guard rather than trust the arithmetic blindly, same as elsewhere in the
// codebase (see CheckoutContext's Math.max(0, ...) total).
export function computeOrderSubtotal(order: Order): number {
  const raw = order.total_amount - order.delivery_fees + order.discount_amount;
  return Number.isFinite(raw) ? Math.max(0, raw) : 0;
}

export function formatOrderDate(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
