"use client";

import { useEffect, useRef, useState } from "react";
import { createTicket, getMyTickets } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useDictionary, useLang } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { showToast } from "@/lib/toast";
import type { Ticket, TicketPriority } from "@/lib/types";
import { useModalA11y } from "@/lib/useModalA11y";
import styles from "./TicketModal.module.css";

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
}

// Category values sent to the API are fixed French strings regardless of UI
// language — the admin dashboard filters/displays tickets by these exact
// values (see admin/components/create-ticket-modal.tsx), so only the label
// shown to the shopper is translated, not what gets stored.
const CATEGORY_DEFS = [
  { id: "delivery", value: "Livraison", labelKey: "categoryDelivery" },
  { id: "payment", value: "Paiement", labelKey: "categoryPayment" },
  { id: "product", value: "Produit", labelKey: "categoryProduct" },
  { id: "account", value: "Compte", labelKey: "categoryAccount" },
  { id: "return", value: "Retour / Remboursement", labelKey: "categoryReturn" },
  { id: "other", value: "Autre", labelKey: "categoryOther" },
] as const;

type PriorityLabelKey = "priorityLow" | "priorityMedium" | "priorityHigh" | "priorityUrgent";

const PRIORITY_DEFS: { value: TicketPriority; labelKey: PriorityLabelKey }[] = [
  { value: "basse", labelKey: "priorityLow" },
  { value: "moyenne", labelKey: "priorityMedium" },
  { value: "haute", labelKey: "priorityHigh" },
  { value: "urgente", labelKey: "priorityUrgent" },
];

const PRIORITY_LABEL_KEYS: Record<TicketPriority, PriorityLabelKey> = {
  basse: "priorityLow",
  moyenne: "priorityMedium",
  haute: "priorityHigh",
  urgente: "priorityUrgent",
};

const STATUS_LABEL_KEYS: Record<Ticket["status"], "statusOpen" | "statusInProgress" | "statusResolved" | "statusClosed"> = {
  ouvert: "statusOpen",
  en_cours: "statusInProgress",
  résolu: "statusResolved",
  fermé: "statusClosed",
};

const STATUS_CLASS: Record<Ticket["status"], string> = {
  ouvert: "statusOpen",
  en_cours: "statusInProgress",
  résolu: "statusResolved",
  fermé: "statusClosed",
};

// Shared support-ticket dialog: opened from the desktop floating SupportButton
// and from the "Nous contacter" row in the mobile/desktop profile pages. Talks
// to the customer-facing GET/POST /tickets endpoints (distinct from the
// admin-only ticket routes — a shopper can only see/create their own tickets).
export default function TicketModal({ open, onClose }: TicketModalProps) {
  const dict = useDictionary();
  const lang = useLang();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [view, setView] = useState<"new" | "list">("new");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("moyenne");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Wraps onClose so the overlay's onClick and Escape (via useModalA11y)
  // can't abandon an in-flight ticket submission — mirrors the guard in
  // DeleteAccountModal/EditProfileModal.
  function handleClose() {
    if (submitting) return;
    onClose();
  }

  useModalA11y(open, handleClose, modalRef);

  function formatDate(iso: string): string {
    return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  }

  useEffect(() => {
    if (!open) return;

    const session = getSession();
    if (!session) {
      setLoggedIn(false);
      return;
    }

    setLoggedIn(true);
    setToken(session.token);
    getMyTickets(session.token)
      .then(setTickets)
      .catch(() => setTickets([]));
  }, [open]);

  useEffect(() => {
    if (open) return;
    // Reset transient form/feedback/view state on close so reopening starts fresh.
    setSubject("");
    setCategory("");
    setPriority("moyenne");
    setMessage("");
    setView("new");
    setExpandedId(null);
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !category) return;

    setSubmitting(true);
    try {
      const created = await createTicket(token, {
        subject: subject.trim(),
        category,
        priority,
        message: message.trim() || null,
      });
      setTickets((prev) => [created, ...prev]);
      setSubject("");
      setCategory("");
      setMessage("");
      showToast(dict.tickets.successMessage, "success");
      window.setTimeout(() => {
        setView("list");
        setExpandedId(created.id);
      }, 1200);
    } catch {
      showToast(dict.tickets.genericError, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{dict.tickets.modalTitle}</h2>
            <p className={styles.subtitle}>{dict.tickets.modalSubtitle}</p>
          </div>
          <button type="button" className={styles.closeButton} aria-label={dict.tickets.close} onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        {loggedIn === false && (
          <div className={styles.loginPrompt}>
            <p>{dict.tickets.loginPrompt}</p>
            <LocaleLink href="/connexion" className={styles.loginLink} onClick={onClose}>
              {dict.tickets.login}
            </LocaleLink>
          </div>
        )}

        {loggedIn && (
          <div className={styles.body}>
            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={view === "new"}
                className={`${styles.tab} ${view === "new" ? styles.tabActive : ""}`}
                onClick={() => setView("new")}
              >
                {dict.tickets.newTicket}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "list"}
                className={`${styles.tab} ${view === "list" ? styles.tabActive : ""}`}
                onClick={() => setView("list")}
              >
                {dict.tickets.myTickets}
                {tickets.length > 0 && <span className={styles.tabCount}>{tickets.length}</span>}
              </button>
            </div>

            {view === "new" && (
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.field}>
                  <span className={styles.label}>{dict.tickets.subject}</span>
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={dict.tickets.subjectPlaceholder}
                    className={styles.input}
                  />
                </label>

                <div className={styles.row}>
                  <label className={styles.field}>
                    <span className={styles.label}>{dict.tickets.category}</span>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={styles.select}
                    >
                      <option value="">{dict.tickets.categoryPlaceholder}</option>
                      {CATEGORY_DEFS.map((c) => (
                        <option key={c.id} value={c.value}>
                          {dict.tickets[c.labelKey]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>{dict.tickets.priority}</span>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TicketPriority)}
                      className={styles.select}
                    >
                      {PRIORITY_DEFS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {dict.tickets[p.labelKey]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className={styles.field}>
                  <span className={styles.label}>{dict.tickets.message}</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={dict.tickets.messagePlaceholder}
                    rows={3}
                    className={styles.textarea}
                  />
                </label>

                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? dict.tickets.submitting : dict.tickets.submit}
                </button>
              </form>
            )}

            {view === "list" && (
              <div className={styles.ticketsSection}>
                {tickets.length === 0 ? (
                  <p className={styles.noTickets}>{dict.tickets.noTickets}</p>
                ) : (
                  <ul className={styles.ticketsList}>
                    {tickets.map((t) => {
                      const isExpanded = expandedId === t.id;
                      return (
                        <li key={t.id} className={styles.ticketItem}>
                          <button
                            type="button"
                            className={styles.ticketItemTop}
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedId(isExpanded ? null : t.id)}
                          >
                            <span className={styles.ticketSubject}>{t.subject}</span>
                            <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[t.status]]}`}>
                              {dict.tickets[STATUS_LABEL_KEYS[t.status]]}
                            </span>
                          </button>
                          <span className={styles.ticketMeta}>
                            {t.category} · {formatDate(t.created_at)}
                          </span>

                          {isExpanded && (
                            <div className={styles.ticketDetail}>
                              {t.message && <p className={styles.ticketMessage}>{t.message}</p>}
                              <div className={styles.ticketDetailMeta}>
                                <span>
                                  {dict.tickets.priority}: {dict.tickets[PRIORITY_LABEL_KEYS[t.priority]]}
                                </span>
                                {t.assigned_to && <span>{t.assigned_to}</span>}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
