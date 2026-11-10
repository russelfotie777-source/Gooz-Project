"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import BottomNav from "@/components/BottomNav/BottomNav";
import CartItems from "@/components/CartItems/CartItems";
import { getCart, isUnauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hydrateGuestCart } from "@/lib/guestCart";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import type { Cart } from "@/lib/types";
import styles from "./CartPage.module.css";

// Figma: desktop node 1666:1213, mobile node 538:336. The real /cart
// endpoints require an authenticated user (API.md §4), but a guest still
// has a real cart to show here — see lib/guestCart.ts — so this only needs
// a token for the handful of things that genuinely require an account
// (mutating the server cart, coupons); the account itself is still only
// required at checkout (CheckoutContext, untouched by this).
export default function CartPage() {
  const dict = useDictionary();
  const [status, setStatus] = useState<"loading" | "guest" | "error" | "ready">("loading");
  const [cart, setCart] = useState<Cart | null>(null);
  const [token, setToken] = useState<string | null>(null);

  function loadGuest() {
    setToken(null);
    hydrateGuestCart()
      .then((c) => {
        setCart(c);
        setStatus("guest");
      })
      .catch(() => {
        setCart({ id: 0, items: [], total: 0 });
        setStatus("guest");
      });
  }

  function load() {
    const session = getSession();
    if (!session) {
      setStatus("loading");
      loadGuest();
      return;
    }

    setStatus("loading");
    setToken(session.token);
    getCart(session.token)
      .then((c) => {
        setCart(c);
        setStatus("ready");
      })
      // A 401 means the token really is dead — fall back to the guest cart
      // rather than a login prompt, same as never having logged in at all.
      // Anything else (offline, backend down, a 500) is a technical
      // failure, not the same thing, and shouldn't be treated like one.
      .catch((err) => (isUnauthorized(err) ? loadGuest() : setStatus("error")));
  }

  useEffect(load, []);

  return (
    <div className={styles.page}>
      <Header cartCount={cart?.items.length ?? 0} variant="cart" />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>{dict.cart.title}</h1>
          <h2 className={styles.summaryTitle}>{dict.cart.summaryTitle}</h2>
        </div>

        {status === "loading" && <p className={styles.message}>{dict.cart.loading}</p>}

        {status === "error" && (
          <div className={styles.message}>
            <p>{dict.cart.loadError}</p>
            <button type="button" className={styles.loginLink} onClick={load}>
              {dict.cart.retry}
            </button>
          </div>
        )}

        {(status === "ready" || status === "guest") && cart && (
          <CartItems initialItems={cart.items} initialTotal={cart.total} token={token} />
        )}
      </main>

      <Footer />

      <BottomNav active="cart" />
    </div>
  );
}
