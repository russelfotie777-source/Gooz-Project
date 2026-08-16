"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { apiFetch, Paginated } from "@/lib/api";

type LedgerEntry = {
  id: number;
  warehouse: { id: number; name: string } | null;
  product: { id: number; name: string } | null;
  variant: { id: number; display_name: string | null } | null;
  movement_type: string;
  quantity_delta: number;
  quantity_after: number;
  actor: { id: number; name: string } | null;
  created_at: string;
};

const MOVEMENT_LABELS: Record<string, string> = {
  adjustment: "Ajustement",
  order: "Commande",
};

const MOVEMENT_COLORS: Record<string, string> = {
  adjustment: "bg-amber-500/10 text-amber-400",
  order: "bg-blue-500/10 text-blue-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function JournalInventairePage() {
  const [entries, setEntries] = useState<LedgerEntry[] | null>(null);
  const [meta, setMeta] = useState<Paginated<LedgerEntry>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });
    if (search) query.set("q", search);
    if (movementType) query.set("movement_type", movementType);

    apiFetch<Paginated<LedgerEntry>>(`/admin/inventory-ledgers?${query.toString()}`)
      .then((res) => {
        setEntries(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger le journal d'inventaire."));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, movementType]);

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Journal d&apos;inventaire</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Journal d&apos;inventaire</h1>
        <p className="mt-1 text-sm text-white/40">
          Historique complet des mouvements de stock (ajustements, commandes...), en lecture seule.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 p-4">
          <select
            value={movementType}
            onChange={(e) => {
              setPage(1);
              setMovementType(e.target.value);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
          >
            <option value="" className="bg-[#12141c]">
              Tous les mouvements
            </option>
            <option value="adjustment" className="bg-[#12141c]">
              Ajustement
            </option>
            <option value="order" className="bg-[#12141c]">
              Commande
            </option>
          </select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Produit..."
              className="w-64 rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Emplacement</th>
              <th className="px-5 py-3 font-medium">Produit</th>
              <th className="px-5 py-3 font-medium">Variante</th>
              <th className="px-5 py-3 font-medium">Mouvement</th>
              <th className="px-5 py-3 font-medium">Après stock</th>
              <th className="px-5 py-3 font-medium">Acteur</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries?.map((entry) => (
              <tr key={entry.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-medium text-white">{entry.warehouse?.name ?? "—"}</td>
                <td className="px-5 py-3 text-white/60">{entry.product?.name ?? "—"}</td>
                <td className="px-5 py-3 text-white/60">{entry.variant?.display_name ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      MOVEMENT_COLORS[entry.movement_type] ?? "bg-white/5 text-white/50"
                    }`}
                  >
                    {MOVEMENT_LABELS[entry.movement_type] ?? entry.movement_type}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      entry.quantity_delta < 0
                        ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {entry.quantity_after}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">{entry.actor?.name ?? "—"}</td>
                <td className="px-5 py-3 text-white/60">{formatDate(entry.created_at)}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/dashboard/journal-inventaire/${entry.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {entries?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun mouvement de stock.</p>
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
