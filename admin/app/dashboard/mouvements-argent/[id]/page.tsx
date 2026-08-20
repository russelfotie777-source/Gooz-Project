"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

type MoneyMovement = {
  id: number;
  account: { id: number; name: string } | null;
  cash_session: { id: number } | null;
  direction: "credit" | "debit";
  amount: string;
  currency: string;
  channel: string;
  is_locked: boolean;
  creator: { id: number; name: string } | null;
  created_at: string;
};

const CHANNEL_LABELS: Record<string, string> = {
  online: "Online",
  pos: "Point de vente",
  manual: "Manuel",
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

export default function MouvementArgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const movementId = Number(params.id);

  const [movement, setMovement] = useState<MoneyMovement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: MoneyMovement }>(`/admin/money-movements/${movementId}`)
      .then((res) => setMovement(res.data))
      .catch(() => setError("Impossible de charger ce mouvement d'argent."));
  }, [movementId]);

  if (!movement) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-sm text-red-400">{error}</p> : <p className="text-sm text-white/40">Chargement…</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/mouvements-argent" className="hover:text-white/70">
          Mouvements d&apos;argent
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Afficher</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Afficher Mouvement d&apos;argent</h1>

      <Section title="Aperçu">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Sens">
            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                movement.direction === "credit"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {movement.direction === "credit" ? "Crédit" : "Débit"}
            </span>
          </Field>
          <Field label="Montant">{Number(movement.amount).toLocaleString("fr-FR")} {movement.currency}</Field>
          <Field label="Devise">{movement.currency}</Field>
          <Field label="Session de caisse">
            {movement.cash_session ? `#${movement.cash_session.id}` : "—"}
          </Field>
          <Field label="Channel">{CHANNEL_LABELS[movement.channel] ?? movement.channel}</Field>
          <Field label="Compte">{movement.account?.name ?? "—"}</Field>
        </div>
      </Section>

      <Section title="Workflow">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Verrouillé">{movement.is_locked ? "Oui" : "Non"}</Field>
          <Field label="Créé par">{movement.creator?.name ?? "—"}</Field>
          <Field label="Créé le">{formatDate(movement.created_at)}</Field>
        </div>
      </Section>

      <button
        onClick={() => router.push("/dashboard/mouvements-argent")}
        className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
      >
        Retour à la liste
      </button>
    </div>
  );
}
