"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, XCircle } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Line = {
  id: number;
  purchase_order_line: {
    id: number;
    product: { id: number; name: string } | null;
    variant: { id: number; display_name: string | null } | null;
  } | null;
  quantity: number;
  unit_price: string;
  line_total: string;
};

type PurchaseInvoice = {
  id: number;
  code: string;
  purchase_order: { id: number; code: string } | null;
  supplier: { id: number; company_name: string } | null;
  currency: string;
  invoice_date: string;
  due_date: string | null;
  reference: string | null;
  attachment_url: string | null;
  notes: string | null;
  status: "enregistrée" | "annulée";
  is_paid: boolean;
  total: string;
  lines: Line[];
  creator: { id: number; name: string } | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  enregistrée: "Enregistrée",
  annulée: "Annulée",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", { dateStyle: "long" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <h2 className="mb-5 text-sm font-semibold text-white/70">{title}</h2>
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

export default function FactureAchatDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invoiceId = Number(params.id);

  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch<{ data: PurchaseInvoice }>(`/admin/purchase-invoices/${invoiceId}`)
      .then((res) => setInvoice(res.data))
      .catch(() => setError("Impossible de charger cette facture d'achat."));
  }

  useEffect(load, [invoiceId]);

  async function togglePaid() {
    if (!invoice) return;
    setBusy(true);
    try {
      await apiFetch(`/admin/purchase-invoices/${invoice.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_paid: !invoice.is_paid }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setBusy(false);
    }
  }

  async function cancelInvoice() {
    if (!invoice) return;
    if (!confirm("Annuler cette facture d'achat ? La quantité facturable de la commande sera restaurée.")) return;
    setBusy(true);
    try {
      await apiFetch(`/admin/purchase-invoices/${invoice.id}/cancel`, { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'annulation.");
    } finally {
      setBusy(false);
    }
  }

  if (!invoice) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-sm text-red-400">{error}</p> : <p className="text-sm text-white/40">Chargement…</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/factures-achat" className="hover:text-white/70">
          Factures D&apos;achat
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{invoice.code}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{invoice.code}</h1>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            invoice.status === "enregistrée" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {STATUS_LABELS[invoice.status] ?? invoice.status}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Section title="Aperçu">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Commande d'achat">{invoice.purchase_order?.code ?? "—"}</Field>
          <Field label="Fournisseur">{invoice.supplier?.company_name ?? "—"}</Field>
          <Field label="Devise">{invoice.currency}</Field>
          <Field label="Date de facture">{formatDate(invoice.invoice_date)}</Field>
          <Field label="Date d'échéance">{formatDate(invoice.due_date)}</Field>
          <Field label="Référence">{invoice.reference ?? "—"}</Field>
          <Field label="Total">{Number(invoice.total).toLocaleString("fr-FR")} {invoice.currency}</Field>
          <Field label="Payé">{invoice.is_paid ? "Oui" : "Non"}</Field>
          <Field label="Pièce jointe">
            {invoice.attachment_url ? (
              <a
                href={invoice.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue hover:underline"
              >
                Voir le fichier
              </a>
            ) : (
              "—"
            )}
          </Field>
          {invoice.notes && (
            <div className="sm:col-span-3">
              <p className="text-xs text-white/40">Notes</p>
              <p className="mt-1 text-sm text-white">{invoice.notes}</p>
            </div>
          )}
        </div>
      </Section>

      <Section title="Lignes">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="pb-3 font-medium">Produit</th>
              <th className="pb-3 font-medium">Variante</th>
              <th className="pb-3 font-medium">Quantité</th>
              <th className="pb-3 font-medium">Prix unitaire</th>
              <th className="pb-3 font-medium">Total ligne</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.id} className="border-b border-white/5 last:border-0">
                <td className="py-3 font-medium text-white">{line.purchase_order_line?.product?.name ?? "—"}</td>
                <td className="py-3 text-white/60">{line.purchase_order_line?.variant?.display_name ?? "—"}</td>
                <td className="py-3 text-white/60">{line.quantity}</td>
                <td className="py-3 text-white/60">{Number(line.unit_price).toLocaleString("fr-FR")} {invoice.currency}</td>
                <td className="py-3 text-white/60">{Number(line.line_total).toLocaleString("fr-FR")} {invoice.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <div className="flex flex-wrap gap-3">
        {invoice.status === "enregistrée" && (
          <button
            onClick={togglePaid}
            disabled={busy}
            className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
          >
            {invoice.is_paid ? "Marquer impayée" : "Marquer payée"}
          </button>
        )}
        {invoice.status === "enregistrée" && (
          <button
            onClick={cancelInvoice}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Annuler la facture
          </button>
        )}
        <button
          onClick={() => router.push("/dashboard/factures-achat")}
          className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  );
}
