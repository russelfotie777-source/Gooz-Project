"use client";

import { useState } from "react";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import type { AddressPayload } from "@/lib/api";
import type { Address } from "@/lib/types";
import AddressForm from "./AddressForm";
import { useAddresses } from "./useAddresses";
import styles from "./AddressesDesktop.module.css";

// Desktop address book — same data/actions as AddressesPage (mobile), laid
// out as a card grid with Header/Footer chrome, consistent with the other
// desktop account pages (see ProfileDesktop).
export default function AddressesDesktop() {
  const dict = useDictionary();
  const { status, addresses, pending, create, update, remove, setDefault } = useAddresses();
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
    try {
      await remove(id);
      setConfirmingDeleteId(null);
    } catch {
      // Error is surfaced via a toast (see useAddresses); keep the confirm
      // row open so the user can retry instead of losing their place.
    }
  }

  async function handleSetDefault(id: number) {
    try {
      await setDefault(id);
    } catch {
      // Error is surfaced via a toast (see useAddresses).
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>{dict.addresses.title}</h1>
          <p className={styles.subtitle}>{dict.addresses.subtitle}</p>
        </div>

        {status === "loading" && <p className={styles.message}>{dict.addresses.loading}</p>}

        {status === "loggedOut" && (
          <div className={styles.guestPanel}>
            <p>{dict.addresses.loginPrompt}</p>
            <LocaleLink href="/connexion" className={styles.loginLink}>
              {dict.addresses.login}
            </LocaleLink>
          </div>
        )}

        {status === "ready" && view === "form" && (
          <div className={styles.formWrapper}>
            <AddressForm initial={editing} onSubmit={handleSubmit} onCancel={() => setView("list")} />
          </div>
        )}

        {status === "ready" && view === "list" && (
          <>
            {addresses.length === 0 && <p className={styles.message}>{dict.addresses.empty}</p>}

            <div className={styles.grid}>
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
                        disabled={pending}
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
                          disabled={pending}
                          onClick={() => handleSetDefault(address.id)}
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

              <button type="button" className={styles.addCard} onClick={openCreate}>
                <img src="/icon/cart/add.svg" alt="" className={styles.addIcon} />
                {dict.addresses.addButton}
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
