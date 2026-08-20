"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type Period = {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  status: "ouverte" | "fermée";
  creator: { id: number; name: string } | null;
  cash_sessions_count: number;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  ouverte: "Ouverte",
  fermée: "Fermée",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

export default function PeriodesComptablesPage() {
  const router = useRouter();
  const [periods, setPeriods] = useState<Period[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Period>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });

    apiFetch<Paginated<Period>>(`/admin/accounting-periods?${query.toString()}`)
      .then((res) => {
        setPeriods(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les périodes comptables."));
  }

  useEffect(load, [page]);

  async function deletePeriod(id: number) {
    if (!confirm("Supprimer cette période comptable ?")) return;
    try {
      await apiFetch(`/admin/accounting-periods/${id}`, { method: "DELETE" });
      setPeriods((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Périodes comptables</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Périodes comptables</h1>
          <p className="mt-1 text-sm text-white/40">
            Définissez les périodes utilisées pour ouvrir les sessions de caisse.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/periodes-comptables/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Nouvelle période
        </button>
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
              <th className="px-5 py-3 font-medium">Nom</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Début</th>
              <th className="px-5 py-3 font-medium">Fin</th>
              <th className="px-5 py-3 font-medium">Créé par</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {periods?.map((period) => (
              <tr key={period.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-medium text-white">{period.name}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      period.status === "ouverte"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {STATUS_LABELS[period.status] ?? period.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">{formatDate(period.start_date)}</td>
                <td className="px-5 py-3 text-white/60">{formatDate(period.end_date)}</td>
                <td className="px-5 py-3 text-white/60">{period.creator?.name ?? "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => deletePeriod(period.id)}
                    disabled={period.cash_sessions_count > 0}
                    className="rounded-lg p-2 text-red-400 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                    title={
                      period.cash_sessions_count > 0
                        ? "Cette période a des sessions de caisse liées"
                        : "Supprimer"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {periods?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucune période comptable.</p>
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
