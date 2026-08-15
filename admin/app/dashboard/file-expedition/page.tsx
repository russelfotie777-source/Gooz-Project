"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { apiFetch, Paginated } from "@/lib/api";

type Delivery = {
  id: number;
  order_id: number;
  order: {
    id: number;
    order_reference: string;
    status: string;
    total_amount: number;
    user: { id: number; name: string } | null;
    payment_status: string | null;
  } | null;
  delivery_boy: { id: number; name: string; phone: string } | null;
  delivery_status: string;
  created_at: string;
};

const DELIVERY_STATUSES = ["en_attente", "pris_en_charge", "en_transit", "livré", "échec"];

const STATUS_STYLES: Record<string, string> = {
  en_attente: "bg-amber-500/10 text-amber-400",
  pris_en_charge: "bg-brand-blue/10 text-brand-blue",
  en_transit: "bg-sky-500/10 text-sky-400",
  livré: "bg-emerald-500/10 text-emerald-400",
  échec: "bg-red-500/10 text-red-400",
};

const PAYMENT_STYLES: Record<string, string> = {
  payé: "bg-emerald-500/10 text-emerald-400",
  en_attente: "bg-amber-500/10 text-amber-400",
  échoué: "bg-red-500/10 text-red-400",
  remboursé: "bg-white/5 text-white/50",
};

function formatXAF(value: number): string {
  return `${Number(value).toLocaleString("fr-FR")} XAF`;
}

export default function FileExpeditionPage() {
  const [deliveries, setDeliveries] = useState<Delivery[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Delivery>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = new URLSearchParams({ page: String(page) });
      if (statusFilter) query.set("status", statusFilter);
      if (search) query.set("q", search);

      apiFetch<Paginated<Delivery>>(`/admin/deliveries?${query.toString()}`)
        .then((res) => {
          setDeliveries(res.data);
          setMeta(res.meta);
        })
        .catch(() => setError("Impossible de charger la file d'expédition."));
    }, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [page, statusFilter, search]);

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>File expédition</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">File d&apos;expédition</h1>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
          >
            <option value="" className="bg-[#12141c]">
              Tous les statuts
            </option>
            {DELIVERY_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-[#12141c]">
                {s}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Référence ou nom du client..."
              className="w-72 rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Commande</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Livreur</th>
              <th className="px-5 py-3 font-medium">Paiement</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries?.map((delivery) => (
              <tr key={delivery.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{delivery.order?.order_reference ?? "—"}</p>
                  <p className="text-xs text-white/40">{new Date(delivery.created_at).toLocaleDateString("fr-FR")}</p>
                </td>
                <td className="px-5 py-3 text-white/60">{delivery.order?.user?.name ?? "—"}</td>
                <td className="px-5 py-3 text-white/60">{delivery.delivery_boy?.name ?? "Non assigné"}</td>
                <td className="px-5 py-3">
                  {delivery.order?.payment_status ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        PAYMENT_STYLES[delivery.order.payment_status] ?? "bg-white/5 text-white/50"
                      }`}
                    >
                      {delivery.order.payment_status}
                    </span>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-white">
                  {delivery.order ? formatXAF(delivery.order.total_amount) : "—"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[delivery.delivery_status] ?? "bg-white/5 text-white/60"
                    }`}
                  >
                    {delivery.delivery_status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/dashboard/commandes/${delivery.order_id}`}
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

        {deliveries?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucune livraison en file.</p>
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
