"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Line = {
  id: number;
  product: { id: number; name: string } | null;
  variant: { id: number; display_name: string | null } | null;
  quantity_ordered: number;
  quantity_invoiced: number;
  quantity_billable: number;
  unit_price: string;
};

type PurchaseOrder = {
  id: number;
  code: string;
  supplier: { id: number; company_name: string } | null;
  currency: string;
  status: "ouverte" | "fermée";
  notes: string | null;
  lines: Line[];
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  ouverte: "Ouverte",
  fermée: "Fermée",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

export default function CommandeAchatDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: PurchaseOrder }>(`/admin/purchase-orders/${orderId}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Impossible de charger cette commande d'achat."));
  }, [orderId]);

  if (!order) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-sm text-red-400">{error}</p> : <p className="text-sm text-white/40">Chargement…</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/commandes-achat" className="hover:text-white/70">
          Commandes d&apos;achat
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{order.code}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{order.code}</h1>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            order.status === "ouverte" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-white/50"
          }`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-white/40">Fournisseur</p>
            <p className="mt-1 text-sm text-white">{order.supplier?.company_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Devise</p>
            <p className="mt-1 text-sm text-white">{order.currency}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Créé le</p>
            <p className="mt-1 text-sm text-white">{formatDate(order.created_at)}</p>
          </div>
          {order.notes && (
            <div className="sm:col-span-3">
              <p className="text-xs text-white/40">Notes</p>
              <p className="mt-1 text-sm text-white">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Lignes</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="pb-3 font-medium">Produit</th>
              <th className="pb-3 font-medium">Variante</th>
              <th className="pb-3 font-medium">Commandé</th>
              <th className="pb-3 font-medium">Facturé</th>
              <th className="pb-3 font-medium">Facturable</th>
              <th className="pb-3 font-medium">Prix unitaire</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={line.id} className="border-b border-white/5 last:border-0">
                <td className="py-3 font-medium text-white">{line.product?.name ?? "—"}</td>
                <td className="py-3 text-white/60">{line.variant?.display_name ?? "—"}</td>
                <td className="py-3 text-white/60">{line.quantity_ordered}</td>
                <td className="py-3 text-white/60">{line.quantity_invoiced}</td>
                <td className="py-3 text-white/60">{line.quantity_billable}</td>
                <td className="py-3 text-white/60">{Number(line.unit_price).toLocaleString("fr-FR")} {order.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => router.push("/dashboard/commandes-achat")}
        className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
      >
        Retour à la liste
      </button>
    </div>
  );
}
