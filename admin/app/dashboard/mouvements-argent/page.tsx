"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Lock, Unlock } from "lucide-react";
import { apiFetch, Paginated } from "@/lib/api";

type MoneyMovement = {
  id: number;
  account: { id: number; name: string } | null;
  cash_session: { id: number } | null;
  direction: "credit" | "debit";
  amount: string;
  currency: string;
  channel: string;
  is_locked: boolean;
  created_at: string;
};

const CHANNEL_LABELS: Record<string, string> = {
  online: "Online",
  pos: "Point de vente",
  manual: "Manuel",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function formatAmount(value: string, currency: string): string {
  return `${Number(value).toLocaleString("fr-FR")} ${currency}`;
}

export default function MouvementsArgentPage() {
  const [movements, setMovements] = useState<MoneyMovement[] | null>(null);
  const [meta, setMeta] = useState<Paginated<MoneyMovement>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });
    if (direction) query.set("direction", direction);

    apiFetch<Paginated<MoneyMovement>>(`/admin/money-movements?${query.toString()}`)
      .then((res) => {
        setMovements(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les mouvements d'argent."));
  }

  useEffect(load, [page, direction]);

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Mouvements d&apos;argent</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mouvements d&apos;argent</h1>
        <p className="mt-1 text-sm text-white/40">
          Historique complet des mouvements d&apos;argent (ventes, règlements...), en lecture seule.
        </p>
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
            value={direction}
            onChange={(e) => {
              setPage(1);
              setDirection(e.target.value);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
          >
            <option value="" className="bg-[#12141c]">
              Tous les sens
            </option>
            <option value="credit" className="bg-[#12141c]">
              Crédit
            </option>
            <option value="debit" className="bg-[#12141c]">
              Débit
            </option>
          </select>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Verrouillé</th>
              <th className="px-5 py-3 font-medium">Channel</th>
              <th className="px-5 py-3 font-medium">Session de caisse</th>
              <th className="px-5 py-3 font-medium">Compte</th>
              <th className="px-5 py-3 font-medium">Sens</th>
              <th className="px-5 py-3 font-medium">Montant</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movements?.map((movement) => (
              <tr key={movement.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  {movement.is_locked ? (
                    <Lock className="h-4 w-4 text-white/40" />
                  ) : (
                    <Unlock className="h-4 w-4 text-emerald-400" />
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
                    {CHANNEL_LABELS[movement.channel] ?? movement.channel}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">
                  {movement.cash_session ? `#${movement.cash_session.id}` : "—"}
                </td>
                <td className="px-5 py-3 font-medium text-white">{movement.account?.name ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      movement.direction === "credit"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {movement.direction.toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">{formatAmount(movement.amount, movement.currency)}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/dashboard/mouvements-argent/${movement.id}`}
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

        {movements?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun mouvement d&apos;argent.</p>
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
