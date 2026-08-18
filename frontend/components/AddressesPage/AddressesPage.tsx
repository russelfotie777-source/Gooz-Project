"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav/BottomNav";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import type { AddressPayload } from "@/lib/api";
import type { Address } from "@/lib/types";
import AddressForm from "./AddressForm";
import { useAddresses } from "./useAddresses";
import styles from "./AddressesPage.module.css";

// Mobile address book — reached from the "Adresse de livraison" row in
// ProfilePage. No Figma node (backend-driven feature added after the
// design pass); layout mirrors ProfilePage's card/topBar conventions.
export default function AddressesPage() {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const { status, addresses, create, update, remove, setDefault } = useAddresses();
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Address | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditing(null);
    setView("form");
  }

  function openEdit(address: Address) {
    setEditing(address);
    setView("form");
  }

  async function handleSubmit(payload: AddressPayload) {
    if (editing) await update(editing.id, payload);
    else await create(payload);
    setView("list");
  }

  async function handleDelete(id: number) {
    await remove(id);
    setConfirmingDeleteId(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backButton}
          aria-label={dict.header.back}
          onClick={() => (view === "list" ? router.back() : setView("list"))}
        >
          <img src="/icon/product-detail/back.svg" alt="" className={styles.backIcon} />
        </button>
        <h1 className={styles.title}>{dict.addresses.title}</h1>
        <span className={styles.spacer} aria-hidden />
      </div>

      <main className={styles.main}>
        {status === "loading" && <p className={styles.message}>{dict.addresses.loading}</p>}

        {status === "loggedOut" && (
          <div className={styles.message}>
            <p>{dict.addresses.loginPrompt}</p>
            <LocaleLink href="/connexion" className={styles.loginLink}>
              {dict.addresses.login}
            </LocaleLink>
          </div>
        )}

        {status === "ready" && view === "form" && (
          <AddressForm initial={editing} onSubmit={handleSubmit} onCancel={() => setView("list")} />
        )}

        {status === "ready" && view === "list" && (
          <>
            {addresses.length === 0 && <p className={styles.message}>{dict.addresses.empty}</p>}

            <div className={styles.list}>
              {addresses.map((address) => (
                <div key={address.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <p className={styles.cardLabel}>{address.label || address.ville}</p>
                    {address.is_default && (
                      <span className={styles.defaultBadge}>{dict.addresses.defaultBadge}</span>
                    )}
                  </div>
                  <p className={styles.cardRecipient}>
                    {address.recipient_name} · {address.recipient_phone}
                  </p>
                  <p className={styles.cardLine}>
                    {[address.address_line, address.quartier, address.ville].filter(Boolean).join(", ")}
                  </p>

                  {confirmingDeleteId === address.id ? (
                    <div className={styles.confirmRow}>
                      <span className={styles.confirmText}>{dict.addresses.confirmDelete}</span>
                      <button
                        type="button"
                        className={styles.confirmYes}
                        onClick={() => handleDelete(address.id)}
                      >
                        {dict.addresses.confirmDeleteYes}
                      </button>
                      <button
                        type="button"
                        className={styles.confirmCancel}
                        onClick={() => setConfirmingDeleteId(null)}
                      >
                        {dict.addresses.cancel}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.cardActions}>
                      {!address.is_default && (
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() => setDefault(address.id)}
                        >
                          {dict.addresses.setDefault}
                        </button>
                      )}
                      <button type="button" className={styles.actionButton} onClick={() => openEdit(address)}>
                        <img src="/icon/checkout/pen.svg" alt="" className={styles.actionIcon} />
                        {dict.addresses.edit}
                      </button>
                      <button
                        type="button"
                        className={styles.actionButtonDanger}
                        onClick={() => setConfirmingDeleteId(address.id)}
                      >
                        <img src="/icon/cart/delete-red.svg" alt="" className={styles.actionIcon} />
                        {dict.addresses.delete}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button type="button" className={styles.addButton} onClick={openCreate}>
              <img src="/icon/cart/add-white.svg" alt="" className={styles.addIcon} />
              {dict.addresses.addButton}
            </button>
          </>
        )}
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
