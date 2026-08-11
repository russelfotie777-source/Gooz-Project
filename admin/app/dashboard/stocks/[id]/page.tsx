"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Stock = {
  id: number;
  product: { id: number; name: string } | null;
  variant: { id: number; display_name: string | null; barcode: string | null } | null;
  warehouse: { id: number; name: string } | null;
  quantity_available: number;
  quantity_reserved: number;
  quantity_free: number;
  created_at: string;
  updated_at: string;
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} jour${days > 1 ? "s" : ""}`;
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <h2 className="text-sm font-semibold text-white/70">{title}</h2>
      <p className="mb-5 mt-0.5 text-xs text-white/30">{subtitle}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <div className="mt-1 text-sm text-white">{children}</div>
    </div>
  );
}

export default function StockDetailPage() {
  const params = useParams<{ id: string }>();
  const stockId = Number(params.id);
  const [stock, setStock] = useState<Stock | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Stock }>(`/admin/stocks/${stockId}`)
      .then((res) => setStock(res.data))
      .catch(() => setError("Impossible de charger ce stock."));
  }, [stockId]);

  if (!stock) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/stocks" className="hover:text-white/70">
          Stocks
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Afficher</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">
        {stock.product?.name ?? "—"}
        {stock.variant?.display_name ? ` — ${stock.variant.display_name}` : ""}
      </h1>

      <Section title="Aperçu du stock" subtitle="Variante de produit, emplacement et stock actuel">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="pb-3 font-medium">Produit</th>
              <th className="pb-3 font-medium">Variante</th>
              <th className="pb-3 font-medium">Emplacement</th>
              <th className="pb-3 font-medium">Disponible</th>
              <th className="pb-3 font-medium">En stock</th>
              <th className="pb-3 font-medium">Réservé</th>
              <th className="pb-3 font-medium">SKU</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 text-white">{stock.product?.name ?? "—"}</td>
              <td className="py-3 text-white/60">{stock.variant?.display_name ?? "—"}</td>
              <td className="py-3 text-white/60">{stock.warehouse?.name ?? "—"}</td>
              <td className="py-3">
                <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                  {stock.quantity_free}
                </span>
              </td>
              <td className="py-3">
                <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-white/70">
                  {stock.quantity_available}
                </span>
              </td>
              <td className="py-3">
                <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
                  {stock.quantity_reserved}
                </span>
              </td>
              <td className="py-3">
                <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-white/60">
                  {stock.variant?.barcode ?? "—"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="Workflow" subtitle="Horodatage et suivi interne">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="ID interne">{stock.id}</Field>
          <Field label="Créé">{relativeTime(stock.created_at)}</Field>
          <Field label="Dernière mise à jour">{relativeTime(stock.updated_at)}</Field>
        </div>
      </Section>
    </div>
  );
}
