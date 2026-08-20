"use client";

import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { useOrders } from "@/components/OrderHistoryPage/useOrders";
import {
  PAYMENT_METHOD_LABEL_KEYS,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUS_LABEL_KEYS,
  formatOrderDate,
  formatPrice,
} from "@/components/OrderHistoryPage/orderLabels";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import styles from "./PaymentHistoryDesktop.module.css";

// Desktop payment history — same data as PaymentHistoryPage (mobile), laid
// out with Header/Footer chrome, consistent with the other desktop account
// pages (see OrderHistoryDesktop, AddressesDesktop).
export default function PaymentHistoryDesktop() {
  const dict = useDictionary();
  const lang = useLang();
  const { status, orders } = useOrders();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>{dict.payments.title}</h1>
          <p className={styles.subtitle}>{dict.payments.subtitle}</p>
        </div>

        {status === "loading" && <p className={styles.message}>{dict.payments.loading}</p>}
        {status === "error" && <p className={styles.message}>{dict.payments.genericError}</p>}

        {status === "loggedOut" && (
          <div className={styles.guestPanel}>
            <p>{dict.payments.loginPrompt}</p>
            <LocaleLink href="/connexion" className={styles.loginLink}>
              {dict.payments.login}
            </LocaleLink>
          </div>
        )}

        {status === "ready" && orders.length === 0 && <p className={styles.message}>{dict.payments.empty}</p>}

        {status === "ready" && orders.length > 0 && (
          <div className={styles.list}>
            {orders.map((order) => (
              <div key={order.id} className={styles.card}>
                <div className={styles.cardHeaderText}>
                  <p className={styles.orderRef}>
                    {dict.payments.orderNumber} {order.order_reference}
                  </p>
                  <p className={styles.orderMeta}>
                    {dict.orders[PAYMENT_METHOD_LABEL_KEYS[order.payment.payment_method]]} ·{" "}
                    {dict.payments.placedOn} {formatOrderDate(order.created_at, lang)}
                  </p>
                </div>
                <span
                  className={`${styles.statusBadge} ${styles[PAYMENT_STATUS_CLASS[order.payment.payment_status]]}`}
                >
                  {dict.orders[PAYMENT_STATUS_LABEL_KEYS[order.payment.payment_status]]}
                </span>
                <span className={styles.totalValue}>{formatPrice(order.payment.amount)}</span>
                <LocaleLink href="/commandes" className={styles.viewOrderLink}>
                  {dict.payments.viewOrder}
                </LocaleLink>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
