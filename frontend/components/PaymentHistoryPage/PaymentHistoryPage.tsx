"use client";

import BottomNav from "@/components/BottomNav/BottomNav";
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
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import styles from "./PaymentHistoryPage.module.css";

// Mobile payment history — reached from the "Historique des paiements" row
// in ProfilePage (previously a dead button). Payment-centric view of the
// same data as OrderHistoryPage (GET /orders already embeds payment info
// per order — see Order.payment in lib/types.ts) rather than a duplicate
// order-item breakdown; "View order" links to the full order detail.
export default function PaymentHistoryPage() {
  const dict = useDictionary();
  const lang = useLang();
  const router = useLocaleRouter();
  const { status, orders } = useOrders();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backButton} aria-label={dict.header.back} onClick={() => router.back()}>
          <img src="/icon/product-detail/back.svg" alt="" className={styles.backIcon} />
        </button>
        <h1 className={styles.title}>{dict.payments.title}</h1>
        <span className={styles.spacer} aria-hidden />
      </div>

      <main className={styles.main}>
        {status === "loading" && <p className={styles.message}>{dict.payments.loading}</p>}
        {status === "error" && <p className={styles.message}>{dict.payments.genericError}</p>}

        {status === "loggedOut" && (
          <div className={styles.message}>
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
                <div className={styles.cardHeader}>
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
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.totalLabel}>{dict.payments.amount}</span>
                  <span className={styles.totalValue}>{formatPrice(order.payment.amount)}</span>
                </div>

                <LocaleLink href="/commandes" className={styles.viewOrderLink}>
                  {dict.payments.viewOrder}
                </LocaleLink>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
