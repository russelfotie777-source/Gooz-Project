"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type Adjustment = {
  id: number;
  warehouse: { id: number; name: string } | null;
  creator: { id: number; name: string } | null;
  type: string;
  status: "brouillon" | "appliqué";
  motif: string | null;
  lines_count: number;
  applied_at: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  appliqué: "Appliqué",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function AjustementStockPage() {
  const router = useRouter();
  const [adjustments, setAdjustments] = useState<Adjustment[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Adjustment>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });
    if (status) query.set("status", status);

    apiFetch<Paginated<Adjustment>>(`/admin/stock-adjustments?${query.toString()}`)
      .then((res) => {
        setAdjustments(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les ajustements de stock."));
  }

  useEffect(load, [page, status]);

  async function deleteAdjustment(id: number) {
    if (!confirm("Supprimer cet ajustement (brouillon) ?")) return;
    try {
      await apiFetch(`/admin/stock-adjustments/${id}`, { method: "DELETE" });
      setAdjustments((prev) => prev?.filter((a) => a.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Ajustement de stock</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ajustement de stock</h1>
          <p className="mt-1 text-sm text-white/40">
            Corrigez les quantités en stock (casse, inventaire, perte...) par entrepôt.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/ajustement-stock/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Nouvel ajustement
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
            <option value="brouillon" className="bg-[#12141c]">
              Brouillon
            </option>
            <option value="appliqué" className="bg-[#12141c]">
              Appliqué
            </option>
          </select>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Entrepôt</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Motif</th>
              <th className="px-5 py-3 font-medium">Lignes</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Créé le</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adjustments?.map((adjustment) => (
              <tr key={adjustment.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-medium text-white">{adjustment.warehouse?.name ?? "—"}</td>
                <td className="px-5 py-3 text-white/60">{adjustment.type}</td>
                <td className="px-5 py-3 text-white/60">{adjustment.motif ?? "—"}</td>
                <td className="px-5 py-3 text-white/60">{adjustment.lines_count}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      adjustment.status === "appliqué"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {STATUS_LABELS[adjustment.status] ?? adjustment.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">{formatDate(adjustment.created_at)}</td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === adjustment.id ? null : adjustment.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === adjustment.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/ajustement-stock/${adjustment.id}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        {adjustment.status === "brouillon" && (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              deleteAdjustment(adjustment.id);
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

        {adjustments?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun ajustement de stock.</p>
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
