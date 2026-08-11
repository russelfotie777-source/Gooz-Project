"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";
import { Pager } from "@/components/pager";

type Order = {
  id: number;
  order_reference: string;
  status: string;
  total_amount: number;
  delivery_method: string;
  user: { id: number; name: string; phone: string } | null;
  created_at: string;
};

const STATUSES = ["en_attente", "confirmée", "en_préparation", "expédiée", "livrée", "annulée"];

const STATUS_STYLES: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  confirmée: "bg-blue-100 text-blue-700",
  en_préparation: "bg-violet-100 text-violet-700",
  expédiée: "bg-blue-100 text-blue-700",
  livrée: "bg-emerald-100 text-emerald-700",
  annulée: "bg-red-100 text-red-700",
};

function formatXAF(value: number): string {
  return `${Number(value).toLocaleString("fr-FR")} XAF`;
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Order>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page) });
    if (statusFilter) query.set("status", statusFilter);

    apiFetch<Paginated<Order>>(`/admin/orders?${query.toString()}`)
      .then((res) => {
        setOrders(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les commandes."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  async function handleStatusChange(orderId: number, status: string) {
    setUpdatingId(orderId);
    try {
      await apiFetch(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev?.map((o) => (o.id === orderId ? { ...o, status } : o)) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Commandes</h1>
          <p className="mt-1 text-sm text-zinc-500">Suivi et traitement des commandes clients.</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-brand-orange/60"
        >
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-400">
              <th className="px-5 py-3 font-medium">Référence</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Livraison</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60">
                <td className="px-5 py-3 font-medium text-zinc-900">{order.order_reference}</td>
                <td className="px-5 py-3 text-zinc-600">
                  {order.user ? `${order.user.name} · ${order.user.phone}` : "—"}
                </td>
                <td className="px-5 py-3 text-zinc-900">{formatXAF(order.total_amount)}</td>
                <td className="px-5 py-3 text-zinc-500 capitalize">{order.delivery_method}</td>
                <td className="px-5 py-3">
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none ${
                      STATUS_STYLES[order.status] ?? "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3 text-zinc-400">
                  {new Date(order.created_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-zinc-400">Aucune commande.</p>
        )}

        {meta && (
          <div className="px-5 py-4">
            <Pager page={meta.current_page} lastPage={meta.last_page} total={meta.total} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
