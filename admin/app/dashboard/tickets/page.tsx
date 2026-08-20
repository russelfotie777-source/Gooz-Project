"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Plus, Search, X } from "lucide-react";
import { apiFetch, Paginated } from "@/lib/api";
import { CreateTicketModal } from "@/components/create-ticket-modal";

type Ticket = {
  id: number;
  customer_name: string | null;
  customer_phone: string | null;
  subject: string;
  category: string;
  priority: "basse" | "moyenne" | "haute" | "urgente";
  status: "ouvert" | "en_cours" | "résolu" | "fermé";
  assigned_to: string | null;
  created_at: string;
};

type ClientOption = { id: number; name: string; phone: string };

const CATEGORIES = ["Livraison", "Paiement", "Produit", "Compte", "Retour / Remboursement", "Autre"];

const PRIORITY_LABELS: Record<Ticket["priority"], string> = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
  urgente: "Urgente",
};

const PRIORITY_STYLES: Record<Ticket["priority"], string> = {
  basse: "bg-white/10 text-white/60",
  moyenne: "bg-sky-500/10 text-sky-400",
  haute: "bg-amber-500/10 text-amber-400",
  urgente: "bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<Ticket["status"], string> = {
  ouvert: "Ouvert",
  en_cours: "En cours",
  résolu: "Résolu",
  fermé: "Fermé",
};

const STATUS_STYLES: Record<Ticket["status"], string> = {
  ouvert: "bg-red-500/10 text-red-400",
  en_cours: "bg-amber-500/10 text-amber-400",
  résolu: "bg-emerald-500/10 text-emerald-400",
  fermé: "bg-white/10 text-white/50",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function ClientPickerModal({ onClose, onPick }: { onClose: () => void; onPick: (client: ClientOption) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ClientOption[]>([]);

  useEffect(() => {
    const query = new URLSearchParams({ role: "customer", per_page: "10" });
    if (q) query.set("q", q);

    const timeout = setTimeout(() => {
      apiFetch<Paginated<ClientOption>>(`/admin/users?${query.toString()}`)
        .then((res) => setResults(res.data))
        .catch(() => setResults([]));
    }, q ? 300 : 0);

    return () => clearTimeout(timeout);
  }, [q]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Sélectionner un client</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom ou téléphone..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-brand-orange/60"
          />
        </div>

        <div className="max-h-72 overflow-y-auto">
          {results.length === 0 && <p className="px-1 py-6 text-center text-sm text-white/30">Aucun client trouvé.</p>}
          {results.map((client) => (
            <button
              key={client.id}
              onClick={() => onPick(client)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/5"
            >
              <span className="font-medium text-white">{client.name}</span>
              <span className="text-white/40">{client.phone}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Ticket>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pickingClient, setPickingClient] = useState(false);
  const [creatingFor, setCreatingFor] = useState<ClientOption | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "20" });
    if (status) query.set("status", status);
    if (priority) query.set("priority", priority);
    if (category) query.set("category", category);
    if (search) query.set("q", search);

    apiFetch<Paginated<Ticket>>(`/admin/tickets?${query.toString()}`)
      .then((res) => {
        setTickets(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les tickets."));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, priority, category, search]);

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Tickets</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <button
          onClick={() => setPickingClient(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Créer
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/5 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Sujet, client, téléphone..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
          >
            <option value="" className="bg-[#12141c]">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-[#12141c]">{label}</option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPage(1);
              setPriority(e.target.value);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
          >
            <option value="" className="bg-[#12141c]">Toutes les priorités</option>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-[#12141c]">{label}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
          >
            <option value="" className="bg-[#12141c]">Toutes les catégories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#12141c]">{cat}</option>
            ))}
          </select>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Sujet</th>
              <th className="px-5 py-3 font-medium">Catégorie</th>
              <th className="px-5 py-3 font-medium">Priorité</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Assigné à</th>
              <th className="px-5 py-3 font-medium">Créé le</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets?.map((ticket) => (
              <tr key={ticket.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-mono text-xs text-white/60">#{ticket.id}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{ticket.customer_name ?? "—"}</p>
                  <p className="text-xs text-white/40">{ticket.customer_phone ?? ""}</p>
                </td>
                <td className="px-5 py-3 text-white/80">{ticket.subject}</td>
                <td className="px-5 py-3 text-white/60">{ticket.category}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-md px-2 py-1 text-xs font-medium ${PRIORITY_STYLES[ticket.priority]}`}>
                    {PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-md px-2 py-1 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}>
                    {STATUS_LABELS[ticket.status] ?? ticket.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">{ticket.assigned_to ?? "Non assigné"}</td>
                <td className="px-5 py-3 text-white/60">{formatDate(ticket.created_at)}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets?.length === 0 && <p className="px-5 py-10 text-center text-sm text-white/30">Aucun ticket</p>}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-5 py-4">
            <p className="text-xs text-white/30">{meta.total} résultat{meta.total > 1 ? "s" : ""}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-white/60">
                {meta.current_page} / {meta.last_page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.last_page}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {pickingClient && (
        <ClientPickerModal
          onClose={() => setPickingClient(false)}
          onPick={(client) => {
            setPickingClient(false);
            setCreatingFor(client);
          }}
        />
      )}

      {creatingFor && (
        <CreateTicketModal
          userId={creatingFor.id}
          userName={creatingFor.name}
          onClose={() => setCreatingFor(null)}
          onCreated={() => {
            setCreatingFor(null);
            load();
          }}
        />
      )}
    </div>
  );
}
