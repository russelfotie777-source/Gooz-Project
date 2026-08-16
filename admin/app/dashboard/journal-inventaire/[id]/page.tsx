"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

type MetaRow = { key: string; value: string };

type LedgerEntry = {
  id: number;
  warehouse: { id: number; name: string } | null;
  product: { id: number; name: string } | null;
  variant: { id: number; display_name: string | null } | null;
  movement_type: string;
  reference: string | null;
  reason: string | null;
  quantity_delta: number;
  reserved_delta: number;
  quantity_before: number;
  quantity_after: number;
  reserved_before: number;
  reserved_after: number;
  actor: { id: number; name: string } | null;
  meta: MetaRow[];
  created_at: string;
};

const MOVEMENT_LABELS: Record<string, string> = {
  adjustment: "Ajustement de stock",
  order: "Commande client",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <h2 className="text-sm font-semibold text-white/70">{title}</h2>
      <p className="mb-5 mt-0.5 text-xs text-white/40">{subtitle}</p>
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

export default function JournalInventaireDetailPage() {
  const params = useParams<{ id: string }>();
  const entryId = Number(params.id);

  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: LedgerEntry }>(`/admin/inventory-ledgers/${entryId}`)
      .then((res) => setEntry(res.data))
      .catch(() => setError("Impossible de charger ce mouvement."));
  }, [entryId]);

  if (!entry) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/journal-inventaire" className="hover:text-white/70">
          Journal d&apos;inventaire
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Voir</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Mouvement #{entry.id}</h1>

      <Section title="Aperçu du mouvement" subtitle="Article, emplacement, type de mouvement et référence">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Date">{formatDate(entry.created_at)}</Field>
          <Field label="Mouvement">
            <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
              {MOVEMENT_LABELS[entry.movement_type] ?? entry.movement_type}
            </span>
          </Field>
          <Field label="Emplacement">{entry.warehouse?.name ?? "—"}</Field>
          <Field label="Produit">{entry.product?.name ?? "—"}</Field>
          <Field label="Variante">{entry.variant?.display_name ?? "—"}</Field>
          <Field label="Référence">{entry.reference ?? "—"}</Field>
          <div className="sm:col-span-3">
            <Field label="Motif">{entry.reason ?? "—"}</Field>
          </div>
        </div>
      </Section>

      <Section title="Quantités" subtitle="Stock disponible et réservé avant/après ce mouvement">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <Field label="Δ Quantité">
            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                entry.quantity_delta < 0 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {entry.quantity_delta > 0 ? `+${entry.quantity_delta}` : entry.quantity_delta}
            </span>
          </Field>
          <Field label="Δ Réservé">
            <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-white/50">
              {entry.reserved_delta > 0 ? `+${entry.reserved_delta}` : entry.reserved_delta}
            </span>
          </Field>
          <div />
          <Field label="Stock disponible avant">{entry.quantity_before}</Field>
          <Field label="Stock disponible après">{entry.quantity_after}</Field>
          <div />
          <Field label="Stock réservé avant">{entry.reserved_before}</Field>
          <Field label="Stock réservé après">{entry.reserved_after}</Field>
        </div>
      </Section>

      <Section title="Acteur & métadonnées" subtitle="Qui a déclenché ce mouvement et détails techniques">
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Acteur">{entry.actor?.name ?? "Système"}</Field>
          <Field label="Enregistré le">{formatDate(entry.created_at)}</Field>
        </div>

        {entry.meta.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
                <th className="px-3 py-2 font-medium">Clé</th>
                <th className="px-3 py-2 font-medium">Valeur</th>
              </tr>
            </thead>
            <tbody>
              {entry.meta.map((row) => (
                <tr key={row.key} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2.5 text-white/60">{row.key}</td>
                  <td className="px-3 py-2.5 text-white">{row.value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}
