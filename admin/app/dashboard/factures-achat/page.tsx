"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Plus, XCircle } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type PurchaseInvoice = {
  id: number;
  code: string;
  purchase_order: { id: number; code: string } | null;
  supplier: { id: number; company_name: string } | null;
  status: "enregistrée" | "annulée";
  is_paid: boolean;
  total: string;
  currency: string;
  invoice_date: string;
};

const STATUS_LABELS: Record<string, string> = {
  enregistrée: "Enregistrée",
  annulée: "Annulée",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

function formatAmount(value: string, currency: string): string {
  return `${Number(value).toLocaleString("fr-FR")} ${currency}`;
}

export default function FacturesAchatPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<PurchaseInvoice[] | null>(null);
  const [meta, setMeta] = useState<Paginated<PurchaseInvoice>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });
    if (status) query.set("status", status);

    apiFetch<Paginated<PurchaseInvoice>>(`/admin/purchase-invoices?${query.toString()}`)
      .then((res) => {
        setInvoices(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les factures d'achat."));
  }

  useEffect(load, [page, status]);

  async function cancelInvoice(id: number) {
    if (!confirm("Annuler cette facture d'achat ? La quantité facturable de la commande sera restaurée.")) return;
    try {
      await apiFetch(`/admin/purchase-invoices/${id}/cancel`, { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'annulation.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Factures D&apos;achat</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Factures D&apos;achat</h1>
        <button
          onClick={() => router.push("/dashboard/factures-achat/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Créer
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
            <option value="enregistrée" className="bg-[#12141c]">
              Enregistrée
            </option>
            <option value="annulée" className="bg-[#12141c]">
              Annulée
            </option>
          </select>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Numéro de facture</th>
              <th className="px-5 py-3 font-medium">Numéro BC</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Fournisseur</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Payé</th>
              <th className="px-5 py-3 font-medium">Date de facture</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices?.map((invoice) => (
              <tr key={invoice.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-mono text-xs text-white">{invoice.code}</td>
                <td className="px-5 py-3 font-mono text-xs text-white/60">{invoice.purchase_order?.code ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      invoice.status === "enregistrée"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {STATUS_LABELS[invoice.status] ?? invoice.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">{invoice.supplier?.company_name ?? "—"}</td>
                <td className="px-5 py-3 text-white/60">{formatAmount(invoice.total, invoice.currency)}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      invoice.is_paid ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {invoice.is_paid ? "Oui" : "Non"}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">{formatDate(invoice.invoice_date)}</td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === invoice.id ? null : invoice.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === invoice.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/factures-achat/${invoice.id}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        {invoice.status === "enregistrée" && (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              cancelInvoice(invoice.id);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                          >
                            <XCircle className="h-4 w-4" />
                            Annuler
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

        {invoices?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun(e) Factures d&apos;achat</p>
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
