"use client";

import { useEffect, useState } from "react";
import { Wallet, ShoppingCart, Receipt } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Overview = {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  orders_by_status: Record<string, number>;
};

const STATUS_STYLES: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  confirmée: "bg-blue-100 text-blue-700",
  en_préparation: "bg-violet-100 text-violet-700",
  expédiée: "bg-blue-100 text-blue-700",
  livrée: "bg-emerald-100 text-emerald-700",
  annulée: "bg-red-100 text-red-700",
};

function formatXAF(value: number): string {
  return `${value.toLocaleString("fr-FR")} XAF`;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Overview>("/admin/stats/overview")
      .then(setOverview)
      .catch(() => setError("Impossible de charger les statistiques."));
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-sm text-zinc-500">Performance globale de la boutique.</p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {overview && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard
              label="Chiffre d'affaires"
              value={formatXAF(overview.total_revenue)}
              icon={Wallet}
              accent="from-brand-orange to-brand-orange-dark"
              glow="shadow-brand-orange/15"
            />
            <StatCard
              label="Commandes"
              value={overview.total_orders.toString()}
              icon={ShoppingCart}
              accent="from-brand-blue to-blue-700"
              glow="shadow-brand-blue/15"
            />
            <StatCard
              label="Panier moyen"
              value={formatXAF(overview.average_order_value)}
              icon={Receipt}
              accent="from-brand-violet to-violet-700"
              glow="shadow-brand-violet/15"
            />
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Commandes par statut
            </h2>
            {Object.keys(overview.orders_by_status).length === 0 ? (
              <p className="text-sm text-zinc-400">Aucune commande pour le moment.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {Object.entries(overview.orders_by_status).map(([status, count]) => (
                  <li
                    key={status}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-zinc-50"
                  >
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {status}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  glow,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  glow: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} shadow-lg ${glow}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}
