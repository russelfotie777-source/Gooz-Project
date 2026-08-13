"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiValidationError, removeCartItem, updateCartItem } from "@/lib/api";
import { notifyCartUpdated } from "@/lib/cartEvents";
import type { CartItemLine } from "@/lib/types";
import styles from "./CartItems.module.css";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

interface CartItemsProps {
  initialItems: CartItemLine[];
  initialTotal: number;
  token: string;
}

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export default function CartItems({ initialItems, initialTotal, token }: CartItemsProps) {
  const [items, setItems] = useState(initialItems);
  const [subtotal, setSubtotal] = useState(initialTotal);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [couponOpen, setCouponOpen] = useState(true);
  const [coupon, setCoupon] = useState("");

  async function updateQuantity(id: number, delta: number) {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    const quantity = Math.max(1, current.quantity + delta);
    if (quantity === current.quantity) return;

    setError(null);
    setPendingId(id);
    try {
      const cart = await updateCartItem(token, id, quantity);
      setItems(cart.items);
      setSubtotal(cart.total);
      notifyCartUpdated(cart.items.length);
    } catch (err) {
      setError(err instanceof ApiValidationError ? (Object.values(err.errors)[0]?.[0] ?? err.message) : "Une erreur est survenue.");
    } finally {
      setPendingId(null);
    }
  }

  async function removeItem(id: number) {
    setError(null);
    setPendingId(id);
    try {
      await removeCartItem(token, id);
      const remaining = items.filter((item) => item.id !== id);
      setItems(remaining);
      setSubtotal(remaining.reduce((sum, item) => sum + item.line_total, 0));
      notifyCartUpdated(remaining.length);
    } catch {
      setError("Impossible de supprimer cet article. Réessayez.");
    } finally {
      setPendingId(null);
    }
  }

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Votre panier est vide.</p>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.list}>
        {error && <p className={styles.error}>{error}</p>}

        {items.map((item) => {
          const image = item.product.images.find((img) => img.is_primary) ?? item.product.images[0];
          const isPending = pendingId === item.id;

          return (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image?.image_url ?? PLACEHOLDER_IMAGE}
                  alt={item.product.name}
                  className={styles.image}
                  onError={(e) => {
                    if (e.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) return;
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>

              <div className={styles.info}>
                <div className={styles.topRow}>
                  <p className={styles.name}>{item.product.name}</p>
                  <p className={styles.unitPrice}>
                    {item.quantity} x {formatPrice(item.unit_price)}
                  </p>
                </div>

                <div className={styles.priceRow}>
                  <p className={styles.price}>{formatPrice(item.line_total)}</p>

                  <div className={styles.bottomRow}>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      aria-label="Supprimer"
                      disabled={isPending}
                      onClick={() => removeItem(item.id)}
                    >
                      <img src="/icon/cart/delete.svg" alt="" className={styles.deleteIconMobile} />
                      <img src="/icon/cart/delete-red.svg" alt="" className={styles.deleteIconDesktop} />
                      <span className={styles.deleteLabel}>Supprimer</span>
                    </button>

                    <div className={styles.quantity}>
                      <button
                        type="button"
                        className={styles.quantityButtonMinus}
                        aria-label="Diminuer la quantité"
                        disabled={isPending}
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <img src="/icon/cart/remove.svg" alt="" className={styles.quantityIconMobile} />
                        <img src="/icon/cart/remove-white.svg" alt="" className={styles.quantityIconDesktop} />
                      </button>
                      <span className={styles.quantityValue}>{item.quantity}</span>
                      <button
                        type="button"
                        className={styles.quantityButtonPlus}
                        aria-label="Augmenter la quantité"
                        disabled={isPending}
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <img src="/icon/cart/add.svg" alt="" className={styles.quantityIconMobile} />
                        <img src="/icon/cart/add-white.svg" alt="" className={styles.quantityIconDesktop} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile — fixed Total + checkout bar (Figma node 554:267) */}
      <div className={styles.mobileTotalBar}>
        <div className={styles.mobileTotalRow}>
          <span className={styles.mobileTotalLabel}>Total :</span>
          <span className={styles.mobileTotalValue}>{formatPrice(total)}</span>
        </div>
        <Link href="/checkout/adresse" className={styles.mobileCheckoutButton}>
          Finalisez votre commande
          <img src="/icon/cart/arrow-right.svg" alt="" className={styles.mobileCheckoutArrow} />
        </Link>
      </div>

      {/* Desktop — order summary sidebar (Figma node 1668:2283) */}
      <aside className={styles.summary}>
        <p className={styles.summaryHeaderLabel}>Total:</p>
        <p className={styles.summaryHeaderValue}>{formatPrice(total)}</p>

        <div className={styles.summaryRow}>
          <span className={styles.summaryRowLabel}>Sous Total</span>
          <span className={styles.summaryRowValue}>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryRowLabel}>Livraison</span>
          <span className={styles.summaryRowValue}>{formatPrice(deliveryFee)}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryRow}>
          <span className={styles.summaryRowLabel}>Total</span>
          <span className={styles.summaryRowValue}>{formatPrice(total)}</span>
        </div>

        <div className={styles.couponSection}>
          <button
            type="button"
            className={styles.couponToggle}
            onClick={() => setCouponOpen((v) => !v)}
            aria-expanded={couponOpen}
          >
            <span>Vous avez un coupon de réduction ?</span>
            <img
              src="/icon/cart/coupon-chevron.svg"
              alt=""
              className={`${styles.couponChevron} ${couponOpen ? styles.couponChevronOpen : ""}`}
            />
          </button>

          {couponOpen && (
            <div className={styles.couponForm}>
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Saisissez le code ici"
                className={styles.couponInput}
              />
              <button type="button" className={styles.couponApply}>
                Appliquer
                <img src="/icon/cart/coupon-check.svg" alt="" className={styles.couponApplyIcon} />
              </button>
            </div>
          )}
        </div>

        <Link href="/checkout" className={styles.checkoutButton}>
          Passer la commande
        </Link>
      </aside>
    </div>
  );
}
