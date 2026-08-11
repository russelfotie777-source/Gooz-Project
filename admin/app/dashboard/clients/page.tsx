"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Search,
  ShieldAlert,
  ShieldOff,
  Ticket,
  UserCheck,
  VolumeX,
  XCircle,
} from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";
import { CreateTicketModal } from "@/components/create-ticket-modal";
import { UserStatusModal } from "@/components/user-status-modal";

type Client = {
  id: number;
  name: string;
  phone: string;
  phone_verified_at: string | null;
  status: "active" | "restricted" | "blocked" | "silently_blocked";
  created_at: string;
};

const TABS: { value: string; label: string }[] = [
  { value: "", label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "restricted", label: "Restreints" },
  { value: "blocked", label: "Bloqués" },
  { value: "silently_blocked", label: "Blocage silencieux" },
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  restricted: "bg-amber-500/10 text-amber-400",
  blocked: "bg-red-500/10 text-red-400",
  silently_blocked: "bg-violet-500/10 text-violet-400",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  restricted: "Restreint",
  blocked: "Bloqué",
  silently_blocked: "Blocage silencieux",
};

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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Client>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [ticketFor, setTicketFor] = useState<Client | null>(null);
  const [statusModal, setStatusModal] = useState<{
    client: Client;
    status: "restricted" | "blocked" | "silently_blocked";
  } | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page), role: "customer" });
    if (tab) query.set("status", tab);
    if (search) query.set("q", search);

    apiFetch<Paginated<Client>>(`/admin/users?${query.toString()}`)
      .then((res) => {
        setClients(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les clients."));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab, search]);

  async function activate(client: Client) {
    setOpenMenuId(null);
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

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="mt-1 text-sm text-white/40">Comptes clients enregistrés sur la boutique.</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] p-1.5">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setPage(1);
                setTab(t.value);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                tab === t.value ? "bg-brand-orange text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Nom ou téléphone..."
            className="w-64 rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
          />
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Vérifié</th>
              <th className="px-5 py-3 font-medium">Inscrit</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{client.phone}</p>
                  <p className="text-xs text-white/40">{client.name || "No name"}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[client.status]}`}>
                    {STATUS_LABELS[client.status]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {client.phone_verified_at ? (
                    <BadgeCheck className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-white/20" />
                  )}
                </td>
                <td className="px-5 py-3 text-white/40">{relativeTime(client.created_at)}</td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === client.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-56 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        <button
                          onClick={() => {
                            setTicketFor(client);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-brand-blue hover:bg-white/5"
                        >
                          <Ticket className="h-4 w-4" />
                          Créer un ticket
                        </button>
                        {client.status !== "active" && (
                          <button
                            onClick={() => activate(client)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-emerald-400 hover:bg-white/5"
                          >
                            <UserCheck className="h-4 w-4" />
                            Activer
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setStatusModal({ client, status: "restricted" });
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-amber-400 hover:bg-white/5"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          Restreindre
                        </button>
                        <button
                          onClick={() => {
                            setStatusModal({ client, status: "blocked" });
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                        >
                          <ShieldOff className="h-4 w-4" />
                          Bloquer
                        </button>
                        <button
                          onClick={() => {
                            setStatusModal({ client, status: "silently_blocked" });
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-violet-400 hover:bg-white/5"
                        >
                          <VolumeX className="h-4 w-4" />
                          Blocage silencieux
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun client trouvé.</p>
        )}

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

      {ticketFor && (
        <CreateTicketModal
          userId={ticketFor.id}
          userName={ticketFor.name || ticketFor.phone}
          onClose={() => setTicketFor(null)}
          onCreated={() => setTicketFor(null)}
        />
      )}

      {statusModal && (
        <UserStatusModal
          userId={statusModal.client.id}
          userName={statusModal.client.name || statusModal.client.phone}
          status={statusModal.status}
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
