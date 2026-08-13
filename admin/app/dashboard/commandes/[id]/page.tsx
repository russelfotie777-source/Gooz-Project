"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Truck } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type OrderItem = {
  id: number;
  product: { id: number; name: string } | null;
  variant: { id: number; display_name: string | null; barcode: string | null } | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type DeliveryBoy = { id: number; name: string; phone: string };

type Delivery = {
  id: number;
  delivery_boy: DeliveryBoy | null;
  delivery_status: string;
  tracking_code: string | null;
};

type Payment = {
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_reference: string | null;
};

type Order = {
  id: number;
  order_reference: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  delivery_fees: number;
  delivery_method: string;
  coupon_code: string | null;
  shipping_address: string | null;
  shipping_phone: string;
  warehouse: { id: number; name: string } | null;
  user: { id: number; name: string; phone: string } | null;
  items: OrderItem[];
  payment: Payment | null;
  delivery: Delivery | null;
  created_at: string;
  updated_at: string;
};

const STATUSES = ["en_attente", "confirmée", "en_préparation", "expédiée", "livrée", "annulée"];

const STATUS_STYLES: Record<string, string> = {
  en_attente: "bg-amber-500/10 text-amber-400",
  confirmée: "bg-brand-blue/10 text-brand-blue",
  en_préparation: "bg-violet-500/10 text-violet-400",
  expédiée: "bg-sky-500/10 text-sky-400",
  livrée: "bg-emerald-500/10 text-emerald-400",
  annulée: "bg-red-500/10 text-red-400",
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
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

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");

  function load() {
    apiFetch<{ data: Order }>(`/admin/orders/${orderId}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Impossible de charger cette commande."));
  }

  useEffect(() => {
    load();
    apiFetch<{ data: DeliveryBoy[] }>("/admin/users?role=delivery")
      .then((res) => setDeliveryBoys(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleStatusChange(status: string) {
    if (!order) return;
    setStatusSaving(true);
    try {
      await apiFetch(`/admin/orders/${order.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setOrder({ ...order, status });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour du statut.");
    } finally {
      setStatusSaving(false);
    }
  }

  async function assignDelivery() {
    if (!order || !selectedDeliveryBoy) return;
    setAssigning(true);
    try {
      await apiFetch(`/admin/orders/${order.id}/delivery`, {
        method: "POST",
        body: JSON.stringify({ delivery_boy_id: Number(selectedDeliveryBoy) }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'assignation du livreur.");
    } finally {
      setAssigning(false);
    }
  }

  if (!order) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  const subtotal = Number(order.total_amount) + Number(order.discount_amount) - Number(order.delivery_fees);

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/commandes" className="hover:text-white/70">
          Commandes
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{order.order_reference}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Commande {order.order_reference}</h1>
        <select
          value={order.status}
          disabled={statusSaving}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`rounded-full border-0 px-3 py-1.5 text-sm font-medium outline-none ${
            STATUS_STYLES[order.status] ?? "bg-white/5 text-white/60"
          }`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-[#12141c] text-white">
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Section title="Aperçu">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Client">{order.user ? order.user.name : "—"}</Field>
          <Field label="Téléphone">{order.shipping_phone}</Field>
          <Field label="Mode">
            <span className="capitalize">{order.delivery_method}</span>
          </Field>
          <Field label="Adresse de livraison">{order.shipping_address ?? "Retrait en entrepôt"}</Field>
          <Field label="Entrepôt">{order.warehouse?.name ?? "—"}</Field>
          <Field label="Code promo">{order.coupon_code ?? "Non disponible"}</Field>
        </div>
      </Section>

      <Section title="Détails financiers">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Sous-total">{formatXAF(subtotal)}</Field>
          <Field label="Remise">{formatXAF(order.discount_amount)}</Field>
          <Field label="Livraison">{formatXAF(order.delivery_fees)}</Field>
          <Field label="Total général">
            <span className="font-semibold text-brand-orange">{formatXAF(order.total_amount)}</span>
          </Field>
          <Field label="Devise">XAF</Field>
        </div>
      </Section>

      <Section title="Articles de la commande">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="pb-3 font-medium">Produit</th>
              <th className="pb-3 font-medium">SKU</th>
              <th className="pb-3 font-medium">Quantité</th>
              <th className="pb-3 font-medium">Prix unitaire</th>
              <th className="pb-3 text-right font-medium">Total ligne</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-white/5 last:border-0">
                <td className="py-2.5">
                  <p className="text-white">{item.product?.name ?? "—"}</p>
                  {item.variant?.display_name && (
                    <p className="text-xs text-white/40">{item.variant.display_name}</p>
                  )}
                </td>
                <td className="py-2.5 text-white/50">{item.variant?.barcode ?? "—"}</td>
                <td className="py-2.5 text-white/60">{item.quantity}</td>
                <td className="py-2.5 text-white/60">{formatXAF(item.unit_price)}</td>
                <td className="py-2.5 text-right font-medium text-white">{formatXAF(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Livraison">
        {order.delivery_method === "retrait" ? (
          <p className="text-sm text-white/30">Retrait en entrepôt — pas de livreur à assigner.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Statut de livraison">
              {order.delivery ? (
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
                  {order.delivery.delivery_status}
                </span>
              ) : (
                "Non assignée"
              )}
            </Field>
            <Field label="Livreur">{order.delivery?.delivery_boy?.name ?? "Non assigné"}</Field>
            <Field label="Code de suivi">{order.delivery?.tracking_code ?? "—"}</Field>

            <div className="sm:col-span-3">
              <label className="mb-1.5 block text-xs text-white/40">
                {order.delivery ? "Réassigner un livreur" : "Assigner un livreur"}
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedDeliveryBoy}
                  onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
                >
                  <option value="" className="bg-[#12141c]">
                    Sélectionnez un livreur
                  </option>
                  {deliveryBoys.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#12141c]">
                      {d.name} · {d.phone}
                    </option>
                  ))}
                </select>
                <button
                  onClick={assignDelivery}
                  disabled={!selectedDeliveryBoy || assigning}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Truck className="h-4 w-4" />
                  {assigning ? "..." : "Assigner"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Section>

      <Section title="Paiement">
        {order.payment ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Montant">{formatXAF(order.payment.amount)}</Field>
            <Field label="Méthode">
              <span className="capitalize">{order.payment.payment_method.replace("_", " ")}</span>
            </Field>
            <Field label="Statut">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  PAYMENT_STYLES[order.payment.payment_status] ?? "bg-white/5 text-white/50"
                }`}
              >
                {order.payment.payment_status}
              </span>
            </Field>
            <Field label="Référence transaction">{order.payment.transaction_reference ?? "—"}</Field>
          </div>
        ) : (
          <p className="text-sm text-white/30">Aucun paiement enregistré.</p>
        )}
      </Section>

      <Section title="Workflow">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Créée le">{formatDate(order.created_at)}</Field>
          <Field label="Mise à jour le">{formatDate(order.updated_at)}</Field>
        </div>
      </Section>
    </div>
  );
}
