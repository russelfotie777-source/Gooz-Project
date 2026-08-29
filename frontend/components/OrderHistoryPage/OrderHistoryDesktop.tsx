"use client";

import { useState } from "react";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import {
  computeOrderSubtotal,
  DELIVERY_METHOD_LABEL_KEYS,
  formatOrderDate,
  formatPrice,
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL_KEYS,
  PAYMENT_METHOD_LABEL_KEYS,
  PAYMENT_STATUS_LABEL_KEYS,
} from "./orderLabels";
import { canRetryPayment, usePaymentRetry } from "@/lib/usePaymentRetry";
import { useOrders } from "./useOrders";
import styles from "./OrderHistoryDesktop.module.css";

// Desktop order history — same data as OrderHistoryPage (mobile), laid out
// as a stacked card list with Header/Footer chrome, consistent with the
// other desktop account pages (see ProfileDesktop, AddressesDesktop).
export default function OrderHistoryDesktop() {
  const dict = useDictionary();
  const lang = useLang();
  const { status, orders } = useOrders();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { retry, retryingId, retryErrorId } = usePaymentRetry();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>{dict.orders.title}</h1>
          <p className={styles.subtitle}>{dict.orders.subtitle}</p>
        </div>

        {status === "loading" && <p className={styles.message}>{dict.orders.loading}</p>}
        {status === "error" && <p className={styles.message}>{dict.orders.genericError}</p>}

        {status === "loggedOut" && (
          <div className={styles.guestPanel}>
            <p>{dict.orders.loginPrompt}</p>
            <LocaleLink href="/connexion" className={styles.loginLink}>
              {dict.orders.login}
            </LocaleLink>
          </div>
        )}

        {status === "ready" && orders.length === 0 && <p className={styles.message}>{dict.orders.empty}</p>}

        {status === "ready" && orders.length > 0 && (
          <div className={styles.list}>
            {orders.map((order) => {
              const isExpanded = expandedId === order.id;
              return (
                <div key={order.id} className={styles.card}>
                  <button
                    type="button"
                    className={styles.cardHeader}
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className={styles.cardHeaderText}>
                      <p className={styles.orderRef}>
                        {dict.orders.orderNumber} {order.order_reference}
                      </p>
                      <p className={styles.orderMeta}>
                        {dict.orders.placedOn} {formatOrderDate(order.created_at, lang)} ·{" "}
                        {dict.orders.items(order.items.length)}
                      </p>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[ORDER_STATUS_CLASS[order.status]]}`}>
                      {dict.orders[ORDER_STATUS_LABEL_KEYS[order.status]]}
                    </span>
                    <span className={styles.totalValue}>{formatPrice(order.total_amount)}</span>
                  </button>

                  {isExpanded && (
                    <div className={styles.detail}>
                      <ul className={styles.itemsList}>
                        {order.items.map((item, index) => (
                          <li key={index} className={styles.itemRow}>
                            <div className={styles.itemInfo}>
                              <p className={styles.itemName}>{item.product.name}</p>
                              {item.variant?.display_name && (
                                <p className={styles.itemVariant}>{item.variant.display_name}</p>
                              )}
                              <p className={styles.itemQty}>
                                {dict.orders.qty} {item.quantity} × {formatPrice(item.unit_price)}
                              </p>
                            </div>
                            <span className={styles.itemTotal}>{formatPrice(item.line_total)}</span>
                          </li>
                        ))}
                      </ul>

                      <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                          <span>{dict.orders.subtotal}</span>
                          <span>{formatPrice(computeOrderSubtotal(order))}</span>
                        </div>
                        {order.discount_amount > 0 && (
                          <div className={styles.summaryRow}>
                            <span>
                              {dict.orders.discount}
                              {order.coupon_code ? ` (${order.coupon_code})` : ""}
                            </span>
                            <span>-{formatPrice(order.discount_amount)}</span>
                          </div>
                        )}
                        <div className={styles.summaryRow}>
                          <span>{dict.orders.deliveryFee}</span>
                          <span>{formatPrice(order.delivery_fees)}</span>
                        </div>
                      </div>

                      <div className={styles.metaGrid}>
                        <div>
                          <p className={styles.metaLabel}>{dict.orders[DELIVERY_METHOD_LABEL_KEYS[order.delivery_method]]}</p>
                          <p className={styles.metaValue}>
                            {order.delivery_method === "livraison"
                              ? `${dict.orders.shippingTo} ${order.shipping_address ?? "—"}`
                              : `${dict.orders.pickupAt} ${order.warehouse?.name ?? "—"}`}
                          </p>
                        </div>
                        <div>
                          <p className={styles.metaLabel}>{dict.orders[PAYMENT_METHOD_LABEL_KEYS[order.payment.payment_method]]}</p>
                          <p className={styles.metaValue}>{dict.orders[PAYMENT_STATUS_LABEL_KEYS[order.payment.payment_status]]}</p>
                        </div>
                      </div>

                      {canRetryPayment(order) && (
                        <>
                          <button
                            type="button"
                            className={styles.payButton}
                            disabled={retryingId === order.id}
                            onClick={() => retry(order)}
                          >
                            {retryingId === order.id ? dict.orders.payNowLoading : dict.orders.payNow}
                          </button>
                          {retryErrorId === order.id && <p className={styles.payError}>{dict.orders.payNowError}</p>}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
