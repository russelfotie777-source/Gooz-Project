"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import { apiFetch, clearToken } from "@/lib/api";

type Overview = {
  total_orders: number;
  orders_by_status: Record<string, number>;
  pending_orders: number;
  orders_today: number;
  total_customers: number;
  low_stock: { product_name: string | null; warehouse_name: string | null; quantity_available: number }[];
};

type Me = { name: string; role: string };

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirmée: "Confirmée",
  en_préparation: "En préparation",
  expédiée: "Expédiée",
  livrée: "Livrée",
  annulée: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  en_attente: "#f59e0b",
  confirmée: "#2563eb",
  en_préparation: "#7c3aed",
  expédiée: "#0ea5e9",
  livrée: "#10b981",
  annulée: "#ef4444",
};
const FALLBACK_COLOR = "#52525b";

function Sparkline({ colorClass, path }: { colorClass: string; path: string }) {
  return (
    <svg viewBox="0 0 120 24" preserveAspectRatio="none" className={`mt-4 h-6 w-full ${colorClass}`}>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DashboardPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Overview>("/admin/stats/overview")
      .then(setOverview)
      .catch(() => setError("Impossible de charger les statistiques."));
    apiFetch<{ data: Me }>("/me")
      .then((res) => setMe(res.data))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await apiFetch("/logout", { method: "POST" });
    } finally {
      clearToken();
      router.replace("/login");
    }
  }

  const statusEntries = overview ? Object.entries(overview.orders_by_status) : [];
  const totalStatusCount = statusEntries.reduce((sum, [, count]) => sum + count, 0);

  let cumulative = 0;
  const gradientStops = statusEntries.map(([status, count]) => {
    const color = STATUS_COLORS[status] ?? FALLBACK_COLOR;
    const start = totalStatusCount > 0 ? (cumulative / totalStatusCount) * 360 : 0;
    cumulative += count;
    const end = totalStatusCount > 0 ? (cumulative / totalStatusCount) * 360 : 0;
    return `${color} ${start}deg ${end}deg`;
  });
  const donutBackground =
    gradientStops.length > 0 ? `conic-gradient(${gradientStops.join(", ")})` : "#27272a";

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-6 flex items-center justify-end gap-4">
        <button className="text-white/40 transition-colors hover:text-white/70">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
          {me ? initials(me.name) : "..."}
        </div>
      </div>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Tableau de bord</h1>

      {error && (
        <p className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
            {me ? initials(me.name) : "AP"}
          </div>
          <div>
            <p className="font-semibold text-white">Bonjour</p>
            <p className="text-sm text-white/40">Administrateur Principal</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Commandes en attente"
              value={overview.pending_orders.toString()}
              note="Commandes en cours de traitement"
              icon={Clock}
              colorClass="text-amber-500"
              sparklinePath="M0 18 Q 20 6, 40 14 T 80 10 T 120 16"
            />
            <StatCard
              label="Total des commandes"
              value={overview.total_orders.toString()}
              note="Toutes les commandes"
              icon={ShieldCheck}
              colorClass="text-emerald-500"
              sparklinePath="M0 20 Q 20 16, 40 8 T 80 12 T 120 4"
            />
            <StatCard
              label="Total des clients"
              value={overview.total_customers.toLocaleString("fr-FR")}
              note="Clients enregistrés"
              icon={Users}
              colorClass="text-amber-500"
              sparklinePath="M0 16 Q 20 4, 40 10 T 80 6 T 120 14"
            />
            <StatCard
              label="Commandes du jour"
              value={overview.orders_today.toString()}
              note="Commandes passées aujourd'hui"
              icon={Calendar}
              colorClass="text-brand-blue"
              sparklinePath="M0 12 Q 20 18, 40 10 T 80 16 T 120 8"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h2 className="mb-6 text-sm font-semibold text-white/70">Statut des commandes</h2>
              {totalStatusCount === 0 ? (
                <p className="text-sm text-white/30">Aucune commande pour le moment.</p>
              ) : (
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
                  <div
                    className="h-56 w-56 shrink-0 rounded-full"
                    style={{
                      background: donutBackground,
                      WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 32px), #000 calc(100% - 32px))",
                      mask: "radial-gradient(farthest-side, transparent calc(100% - 32px), #000 calc(100% - 32px))",
                    }}
                  />
                  <ul className="flex flex-col gap-2.5">
                    {statusEntries.map(([status, count]) => (
                      <li key={status} className="flex items-center gap-2.5 text-sm">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[status] ?? FALLBACK_COLOR }}
                        />
                        <span className="text-white/60">{STATUS_LABELS[status] ?? status}</span>
                        <span className="font-semibold text-white">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h2 className="mb-4 text-sm font-semibold text-white/70">Alertes de stock faible</h2>
              {overview.low_stock.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-white">Aucun article en stock faible</p>
                  <p className="text-sm text-white/40">Tous les produits sont bien approvisionnés !</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
                      <th className="pb-3 font-medium">Produit</th>
                      <th className="pb-3 font-medium">Emplacement</th>
                      <th className="pb-3 text-right font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.low_stock.map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5 last:border-0">
                        <td className="py-2.5">{item.product_name ?? "—"}</td>
                        <td className="py-2.5 text-white/50">{item.warehouse_name ?? "—"}</td>
                        <td className="py-2.5 text-right font-semibold text-amber-400">
                          {item.quantity_available}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  colorClass,
  sparklinePath,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  sparklinePath: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <p className="text-sm text-white/40">{label}</p>
      <p className="mt-2 text-4xl font-bold tracking-tight text-white">{value}</p>
      <p className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${colorClass}`}>
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{note}</span>
      </p>
      <Sparkline colorClass={colorClass} path={sparklinePath} />
    </div>
  );
}
