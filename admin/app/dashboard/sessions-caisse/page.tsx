"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type CashSession = {
  id: number;
  period: { id: number; name: string } | null;
  opener: { id: number; name: string } | null;
  opening_cash: string;
  status: "ouverte" | "fermée";
  opened_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  ouverte: "Ouverte",
  fermée: "Fermée",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function formatAmount(value: string): string {
  return `${Number(value).toLocaleString("fr-FR")} FCFA`;
}

export default function SessionsCaissePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CashSession[] | null>(null);
  const [meta, setMeta] = useState<Paginated<CashSession>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });
    if (status) query.set("status", status);

    apiFetch<Paginated<CashSession>>(`/admin/cash-sessions?${query.toString()}`)
      .then((res) => {
        setSessions(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les sessions de caisse."));
  }

  useEffect(load, [page, status]);

  async function deleteSession(id: number) {
    if (!confirm("Supprimer cette session de caisse ?")) return;
    try {
      await apiFetch(`/admin/cash-sessions/${id}`, { method: "DELETE" });
      setSessions((prev) => prev?.filter((s) => s.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Sessions de caisse</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sessions de caisse</h1>
          <p className="mt-1 text-sm text-white/40">
            Ouvrez et fermez les sessions de caisse rattachées à une période comptable.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/sessions-caisse/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Nouvelle session
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 p-4">
          <span />
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
          >
            <option value="" className="bg-[#12141c]">
              Tous les statuts
            </option>
            <option value="ouverte" className="bg-[#12141c]">
              Ouverte
            </option>
            <option value="fermée" className="bg-[#12141c]">
              Fermée
            </option>
          </select>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Ouvert par</th>
              <th className="px-5 py-3 font-medium">Espèces d&apos;ouverture</th>
              <th className="px-5 py-3 font-medium">Ouvert le</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions?.map((session) => (
              <tr key={session.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-medium text-white">#{session.id}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      session.status === "ouverte"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {STATUS_LABELS[session.status] ?? session.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">{session.opener?.name ?? "—"}</td>
                <td className="px-5 py-3 text-white/60">{formatAmount(session.opening_cash)}</td>
                <td className="px-5 py-3 text-white/60">{formatDate(session.opened_at)}</td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === session.id ? null : session.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === session.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/sessions-caisse/${session.id}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        {session.status === "ouverte" && (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              deleteSession(session.id);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sessions?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun(e) Sessions de caisse</p>
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
    </div>
  );
}
