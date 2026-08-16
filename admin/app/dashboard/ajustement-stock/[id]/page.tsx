"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Line = {
  id: number;
  product: { id: number; name: string } | null;
  variant: { id: number; display_name: string | null; barcode: string | null } | null;
  delta_quantity: number;
  motif: string | null;
  note: string | null;
};

type Adjustment = {
  id: number;
  warehouse: { id: number; name: string } | null;
  creator: { id: number; name: string } | null;
  type: string;
  status: "brouillon" | "appliqué";
  motif: string | null;
  notes: string | null;
  lines: Line[];
  applied_at: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  appliqué: "Appliqué",
};

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

export default function AjustementStockDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const adjustmentId = Number(params.id);

  const [adjustment, setAdjustment] = useState<Adjustment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch<{ data: Adjustment }>(`/admin/stock-adjustments/${adjustmentId}`)
      .then((res) => setAdjustment(res.data))
      .catch(() => setError("Impossible de charger cet ajustement."));
  }

  useEffect(load, [adjustmentId]);

  async function applyAdjustment() {
    if (!confirm("Appliquer cet ajustement ? Le stock sera modifié immédiatement et l'ajustement sera verrouillé."))
      return;
    setError(null);
    setBusy(true);
    try {
      const res = await apiFetch<{ data: Adjustment }>(`/admin/stock-adjustments/${adjustmentId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "appliqué" }),
      });
      setAdjustment(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'application.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAdjustment() {
    if (!confirm("Supprimer cet ajustement (brouillon) ?")) return;
    setBusy(true);
    try {
      await apiFetch(`/admin/stock-adjustments/${adjustmentId}`, { method: "DELETE" });
      router.push("/dashboard/ajustement-stock");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
      setBusy(false);
    }
  }

  if (!adjustment) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/ajustement-stock" className="hover:text-white/70">
          Ajustement de stock
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Voir</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Ajustement #{adjustment.id} — {adjustment.warehouse?.name ?? "—"}
        </h1>
        <div className="flex gap-3">
          {adjustment.status === "brouillon" && (
            <>
              <button
                onClick={applyAdjustment}
                disabled={busy}
                className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
              >
                Appliquer
              </button>
              <button
                onClick={deleteAdjustment}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Section title="Informations générales">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Entrepôt">{adjustment.warehouse?.name ?? "—"}</Field>
          <Field label="Type">{adjustment.type}</Field>
          <Field label="Statut">
            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                adjustment.status === "appliqué"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {STATUS_LABELS[adjustment.status] ?? adjustment.status}
            </span>
          </Field>
          <Field label="Motif">{adjustment.motif ?? "—"}</Field>
          <Field label="Créé par">{adjustment.creator?.name ?? "—"}</Field>
          <Field label="Créé le">{formatDate(adjustment.created_at)}</Field>
          {adjustment.applied_at && <Field label="Appliqué le">{formatDate(adjustment.applied_at)}</Field>}
          {adjustment.notes && (
            <div className="sm:col-span-3">
              <Field label="Notes">{adjustment.notes}</Field>
            </div>
          )}
        </div>
      </Section>

      <Section title={`Lignes (${adjustment.lines.length})`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-3 py-2 font-medium">Produit</th>
              <th className="px-3 py-2 font-medium">Variante</th>
              <th className="px-3 py-2 font-medium">Quantité</th>
              <th className="px-3 py-2 font-medium">Motif</th>
            </tr>
          </thead>
          <tbody>
            {adjustment.lines.map((line) => (
              <tr key={line.id} className="border-b border-white/5 last:border-0">
                <td className="px-3 py-2.5 text-white">{line.product?.name ?? "—"}</td>
                <td className="px-3 py-2.5 text-white/60">{line.variant?.display_name ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      line.delta_quantity < 0
                        ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {line.delta_quantity > 0 ? `+${line.delta_quantity}` : line.delta_quantity}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-white/60">{line.motif ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
