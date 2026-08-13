"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import BottomNav from "@/components/BottomNav/BottomNav";
import CartItems from "@/components/CartItems/CartItems";
import { getCart } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { Cart } from "@/lib/types";
import styles from "./CartPage.module.css";

// Figma: desktop node 1666:1213, mobile node 538:336. The Laravel /cart
// endpoints require an authenticated user (API.md §4), so this is a client
// component reading the session token from localStorage — a logged-out
// visitor sees a prompt to sign in instead of cart contents.
export default function CartPage() {
  const [status, setStatus] = useState<"loading" | "loggedOut" | "ready">("loading");
  const [cart, setCart] = useState<Cart | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setStatus("loggedOut");
      return;
    }

    setToken(session.token);
    getCart(session.token)
      .then((c) => {
        setCart(c);
        setStatus("ready");
      })
      .catch(() => setStatus("loggedOut"));
  }, []);

  return (
    <div className={styles.page}>
      <Header cartCount={cart?.items.length ?? 0} variant="cart" />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>Détails de votre panier</h1>
          <h2 className={styles.summaryTitle}>Résumé de la commande</h2>
        </div>

        {status === "loading" && <p className={styles.message}>Chargement du panier...</p>}

        {status === "loggedOut" && (
          <div className={styles.message}>
            <p>Connectez-vous pour voir votre panier.</p>
            <Link href="/connexion" className={styles.loginLink}>
              Se connecter
            </Link>
          </div>
        )}

        {status === "ready" && cart && token && (
          <CartItems initialItems={cart.items} initialTotal={cart.total} token={token} />
        )}
      </main>

      <Footer />

      <BottomNav active="cart" />
    </div>
  );
}
