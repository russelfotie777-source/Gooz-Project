import type { ApiDeliveryMethod, ApiPaymentMethod, OrderStatus, PaymentStatus } from "@/lib/types";

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

export const DELIVERY_METHOD_LABEL_KEYS: Record<ApiDeliveryMethod, "deliveryMethodHome" | "deliveryMethodPickup"> = {
  livraison: "deliveryMethodHome",
  retrait: "deliveryMethodPickup",
};

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export function formatOrderDate(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
