"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type PurchaseOrderOption = { id: number; code: string };

type OrderLine = {
  id: number;
  product: { id: number; name: string } | null;
  variant: { id: number; display_name: string | null } | null;
  quantity_billable: number;
  unit_price: string;
};

type PurchaseOrderDetail = {
  id: number;
  code: string;
  supplier: { id: number; company_name: string } | null;
  currency: string;
  lines: OrderLine[];
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";
const readOnlyClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/50";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CreateFactureAchatPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PurchaseOrderOption[]>([]);
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [order, setOrder] = useState<PurchaseOrderDetail | null>(null);
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const [invoiceDate, setInvoiceDate] = useState(todayIso());
  const [dueDate, setDueDate] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Paginated<PurchaseOrderOption>>("/admin/purchase-orders?status=ouverte&per_page=100")
      .then((res) => setOrders(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!purchaseOrderId) {
      setOrder(null);
      setQuantities({});
      return;
    }
    apiFetch<{ data: PurchaseOrderDetail }>(`/admin/purchase-orders/${purchaseOrderId}`)
      .then((res) => {
        setOrder(res.data);
        setQuantities({});
      })
      .catch(() => setError("Impossible de charger cette commande d'achat."));
  }, [purchaseOrderId]);

  const billableLines = (order?.lines ?? []).filter((l) => l.quantity_billable > 0);
  const total = billableLines.reduce((sum, line) => {
    const qty = Number(quantities[line.id] ?? 0);
    return sum + qty * Number(line.unit_price);
  }, 0);

  async function submit(andAddAnother: boolean) {
    setError(null);

    const payloadLines = billableLines
      .map((line) => ({ purchase_order_line_id: line.id, quantity: Number(quantities[line.id] ?? 0) }))
      .filter((line) => line.quantity > 0);

    if (!order || payloadLines.length === 0) {
      setError("Sélectionnez une commande et saisissez au moins une quantité à facturer.");
      return;
    }

    const formData = new FormData();
    formData.append("purchase_order_id", String(order.id));
    formData.append("invoice_date", invoiceDate);
    if (dueDate) formData.append("due_date", dueDate);
    if (reference) formData.append("reference", reference);
    if (notes) formData.append("notes", notes);
    if (attachment) formData.append("attachment", attachment);
    payloadLines.forEach((line, i) => {
      formData.append(`lines[${i}][purchase_order_line_id]`, String(line.purchase_order_line_id));
      formData.append(`lines[${i}][quantity]`, String(line.quantity));
    });

    setSubmitting(true);
    try {
      const created = await apiFetch<{ data: { id: number } }>("/admin/purchase-invoices", {
        method: "POST",
        body: formData,
      });

      if (andAddAnother) {
        setPurchaseOrderId("");
        setOrder(null);
        setQuantities({});
        setReference("");
        setNotes("");
        setAttachment(null);
      } else {
        router.push(`/dashboard/factures-achat/${created.data.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/factures-achat" className="hover:text-white/70">
          Factures D&apos;achat
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Créer</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Créer Facture D&apos;achat</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
        className="flex flex-col gap-6"
      >
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-sm font-semibold text-white/70">Détails de facture</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Commande d&apos;achat<span className="text-red-400">*</span>
              </label>
              <select
                required
                value={purchaseOrderId}
                onChange={(e) => setPurchaseOrderId(e.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#12141c]">
                  Sélectionnez une option
                </option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id} className="bg-[#12141c]">
                    {o.code}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-white/40">Sélectionnez une commande avec des quantités facturables.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Fournisseur</label>
              <input readOnly value={order?.supplier?.company_name ?? ""} className={readOnlyClass} />
              <p className="mt-1.5 text-xs text-white/40">Rempli automatiquement depuis la commande sélectionnée.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Devise</label>
              <input readOnly value={order?.currency ?? ""} className={readOnlyClass} />
              <p className="mt-1.5 text-xs text-white/40">Remplie automatiquement depuis la devise de la commande.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Date de facture<span className="text-red-400">*</span>
              </label>
              <input
                required
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-white/40">Date de comptabilisation de la facture.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Date d&apos;échéance</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
              <p className="mt-1.5 text-xs text-white/40">Date de paiement (optionnel).</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Référence</label>
              <input value={reference} onChange={(e) => setReference(e.target.value)} className={inputClass} />
              <p className="mt-1.5 text-xs text-white/40">Numéro ou référence de facture fournisseur.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Facture / reçu fournisseur</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white`}
              />
              <p className="mt-1.5 text-xs text-white/40">
                Téléversez la facture fournisseur, le reçu ou le justificatif. PDF, JPG, PNG ou WebP jusqu&apos;à 5 Mo.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
              <p className="mt-1.5 text-xs text-white/40">Notes internes de comptes fournisseurs.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <h2 className="mb-2 text-sm font-semibold text-white/70">Lignes de facture</h2>
          <p className="mb-5 text-xs text-white/40">Seules les quantités encore facturables sont affichées.</p>

          {!order && <p className="text-sm text-white/30">Sélectionnez d&apos;abord une commande d&apos;achat.</p>}

          {order && billableLines.length === 0 && (
            <p className="text-sm text-white/30">Cette commande n&apos;a plus de quantité facturable.</p>
          )}

          {billableLines.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
                  <th className="pb-3 font-medium">Produit</th>
                  <th className="pb-3 font-medium">Variante</th>
                  <th className="pb-3 font-medium">Facturable</th>
                  <th className="pb-3 font-medium">Quantité à facturer</th>
                  <th className="pb-3 font-medium">Prix unitaire</th>
                </tr>
              </thead>
              <tbody>
                {billableLines.map((line) => (
                  <tr key={line.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 font-medium text-white">{line.product?.name ?? "—"}</td>
                    <td className="py-3 text-white/60">{line.variant?.display_name ?? "—"}</td>
                    <td className="py-3 text-white/60">{line.quantity_billable}</td>
                    <td className="py-3">
                      <input
                        type="number"
                        min="0"
                        max={line.quantity_billable}
                        step="1"
                        value={quantities[line.id] ?? ""}
                        onChange={(e) =>
                          setQuantities((prev) => ({ ...prev, [line.id]: e.target.value }))
                        }
                        className="w-24 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none focus:border-brand-orange/60"
                      />
                    </td>
                    <td className="py-3 text-white/60">
                      {Number(line.unit_price).toLocaleString("fr-FR")} {order?.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {billableLines.length > 0 && (
            <p className="mt-4 text-right text-sm font-semibold text-white">
              Total : {total.toLocaleString("fr-FR")} {order?.currency}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
          >
            {submitting ? "..." : "Créer"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => submit(true)}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 disabled:opacity-50"
          >
            Créer & Ajouter un autre
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/factures-achat")}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
