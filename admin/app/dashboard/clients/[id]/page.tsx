"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ShieldAlert,
  ShieldOff,
  Ticket as TicketIcon,
  UserCheck,
  VolumeX,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { CreateTicketModal } from "@/components/create-ticket-modal";
import { UserStatusModal } from "@/components/user-status-modal";

type StatusHistoryEntry = {
  id: number;
  from_status: string;
  to_status: string;
  reason: string | null;
  changed_by: string | null;
  created_at: string;
};

type TicketEntry = {
  id: number;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
};

type ClientDetail = {
  id: number;
  name: string;
  phone: string;
  phone_verified_at: string | null;
  status: "active" | "restricted" | "blocked" | "silently_blocked";
  status_reason: string | null;
  status_changed_at: string | null;
  created_at: string;
  orders_count: number;
  tickets_count: number;
  addresses_count: number;
  status_histories: StatusHistoryEntry[];
  tickets: TicketEntry[];
};

type Order = {
  id: number;
  order_reference: string;
  status: string;
  total_amount: number;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  restricted: "Restreint",
  blocked: "Bloqué",
  silently_blocked: "Blocage silencieux",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  restricted: "bg-amber-500/10 text-amber-400",
  blocked: "bg-red-500/10 text-red-400",
  silently_blocked: "bg-violet-500/10 text-violet-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "il y a 1 jour";
  if (days < 7) return `il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "il y a 1 semaine";
  if (weeks < 5) return `il y a ${weeks} semaines`;
  const months = Math.floor(days / 30);
  return months <= 1 ? "il y a 1 mois" : `il y a ${months} mois`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <h2 className="mb-5 text-sm font-semibold text-white/70">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <div className="mt-1 text-sm text-white">{children}</div>
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [statusModal, setStatusModal] = useState<"restricted" | "blocked" | "silently_blocked" | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);

  function load() {
    apiFetch<{ data: ClientDetail }>(`/admin/users/${userId}`)
      .then((res) => setClient(res.data))
      .catch(() => setError("Impossible de charger ce client."));
    apiFetch<{ data: Order[] }>(`/admin/orders?user_id=${userId}`)
      .then((res) => setOrders(res.data))
      .catch(() => {});
  }

  useEffect(load, [userId]);

  async function activate() {
    if (!client) return;
    try {
      await apiFetch(`/admin/users/${client.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "active" }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    }
  }

  if (!client) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  const displayedHistory = showAllHistory ? client.status_histories : client.status_histories.slice(0, 3);
  const displayedTickets = showAllTickets ? client.tickets : client.tickets.slice(0, 3);

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/clients" className="hover:text-white/70">
          Clients
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{client.name || "Sans nom"}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {client.name || "Sans nom"} — {client.phone}
        </h1>
        <div className="flex flex-wrap gap-2">
          {client.status !== "active" && (
            <button
              onClick={activate}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white hover:brightness-105"
            >
              <UserCheck className="h-4 w-4" />
              Activer
            </button>
          )}
          <button
            onClick={() => setStatusModal("restricted")}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-medium text-white hover:brightness-105"
          >
            <ShieldAlert className="h-4 w-4" />
            Restreindre
          </button>
          <button
            onClick={() => setStatusModal("blocked")}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white hover:brightness-105"
          >
            <ShieldOff className="h-4 w-4" />
            Bloquer
          </button>
          <button
            onClick={() => setStatusModal("silently_blocked")}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:brightness-105"
          >
            <VolumeX className="h-4 w-4" />
            Blocage silencieux
          </button>
          <button
            onClick={() => setShowTicketModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-3.5 py-2 text-sm font-medium text-white hover:brightness-105"
          >
            <TicketIcon className="h-4 w-4" />
            Ouvrir un ticket
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Section title="Aperçu">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Nom">{client.name || "Sans nom"}</Field>
          <Field label="Statut">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[client.status]}`}>
              {STATUS_LABELS[client.status]}
            </span>
          </Field>
          <Field label="Téléphone">{client.phone}</Field>
          <Field label="Téléphone vérifié">
            {client.phone_verified_at ? (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                Vérifié
              </span>
            ) : (
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/40">
                Non vérifié
              </span>
            )}
          </Field>
          <Field label="Adresse">Indisponible</Field>
        </div>
      </Section>

      <Section title="Statut et activité">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Commandes">
            <span className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-blue">
              {client.orders_count}
            </span>
          </Field>
          <Field label="Tickets">
            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
              {client.tickets_count}
            </span>
          </Field>
          <Field label="Adresses">
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/60">
              {client.addresses_count}
            </span>
          </Field>
          <Field label="Inscrit">{relativeTime(client.created_at)}</Field>
          <Field label="Dernier changement de statut">
            {client.status_changed_at ? relativeTime(client.status_changed_at) : "Indisponible"}
          </Field>
          <Field label="Raison du statut">{client.status_reason || "Indisponible"}</Field>
        </div>
      </Section>

      <Section title="Sales History">
        {!orders || orders.length === 0 ? (
          <p className="text-sm text-white/30">Aucune commande pour ce client.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
                <th className="pb-3 font-medium">Référence</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Montant</th>
                <th className="pb-3 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2.5 font-medium text-white">{order.order_reference}</td>
                  <td className="py-2.5 text-white/60">{order.status}</td>
                  <td className="py-2.5 text-white/60">{order.total_amount.toLocaleString("fr-FR")} XAF</td>
                  <td className="py-2.5 text-right text-white/40">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="Historique du statut">
        {client.status_histories.length === 0 ? (
          <p className="text-sm text-white/30">Aucun changement de statut enregistré.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {displayedHistory.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between border-b border-white/5 pb-3 last:border-0">
                  <div>
                    <p className="text-sm text-white">
                      <span className="text-white/50">{STATUS_LABELS[entry.from_status] ?? entry.from_status}</span>
                      {" → "}
                      <span className="font-medium">{STATUS_LABELS[entry.to_status] ?? entry.to_status}</span>
                    </p>
                    {entry.reason && <p className="mt-0.5 text-xs text-white/40">{entry.reason}</p>}
                    <p className="mt-0.5 text-xs text-white/30">Par {entry.changed_by ?? "Système"}</p>
                  </div>
                  <span className="shrink-0 text-xs text-white/30">{formatDate(entry.created_at)}</span>
                </li>
              ))}
            </ul>
            {client.status_histories.length > 3 && (
              <button
                onClick={() => setShowAllHistory((v) => !v)}
                className="mt-3 text-xs font-medium text-brand-blue hover:underline"
              >
                {showAllHistory ? "Afficher moins" : "Afficher plus"}
              </button>
            )}
          </>
        )}
      </Section>

      <Section title="Tickets client">
        {client.tickets.length === 0 ? (
          <p className="text-sm text-white/30">Aucun ticket pour ce client.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {displayedTickets.map((ticket) => (
                <li key={ticket.id} className="flex items-start justify-between border-b border-white/5 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{ticket.subject}</p>
                    <p className="mt-0.5 text-xs text-white/40">
                      {ticket.category} · Priorité {ticket.priority} · {ticket.assigned_to ?? "Non assigné"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/60">
                    {ticket.status}
                  </span>
                </li>
              ))}
            </ul>
            {client.tickets.length > 3 && (
              <button
                onClick={() => setShowAllTickets((v) => !v)}
                className="mt-3 text-xs font-medium text-brand-blue hover:underline"
              >
                {showAllTickets ? "Afficher moins" : "Afficher plus"}
              </button>
            )}
          </>
        )}
      </Section>

      {showTicketModal && (
        <CreateTicketModal
          userId={client.id}
          userName={client.name || client.phone}
          onClose={() => setShowTicketModal(false)}
          onCreated={() => {
            setShowTicketModal(false);
            load();
          }}
        />
      )}

      {statusModal && (
        <UserStatusModal
          userId={client.id}
          userName={client.name || client.phone}
          status={statusModal}
          onClose={() => setStatusModal(null)}
          onUpdated={() => {
            setStatusModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}
