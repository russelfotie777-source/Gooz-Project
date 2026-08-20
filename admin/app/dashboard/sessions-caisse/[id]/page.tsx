"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type CashSession = {
  id: number;
  period: { id: number; name: string } | null;
  opener: { id: number; name: string } | null;
  closer: { id: number; name: string } | null;
  opening_cash: string;
  closing_cash: string | null;
  status: "ouverte" | "fermée";
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  ouverte: "Ouverte",
  fermée: "Fermée",
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

function formatAmount(value: string | null): string {
  if (value === null) return "—";
  return `${Number(value).toLocaleString("fr-FR")} FCFA`;
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

export default function SessionCaisseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = Number(params.id);

  const [session, setSession] = useState<CashSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [closingCash, setClosingCash] = useState("");
  const [notes, setNotes] = useState("");

  function load() {
    apiFetch<{ data: CashSession }>(`/admin/cash-sessions/${sessionId}`)
      .then((res) => setSession(res.data))
      .catch(() => setError("Impossible de charger cette session de caisse."));
  }

  useEffect(load, [sessionId]);

  async function closeSession(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Fermer cette session de caisse ? Cette action est définitive.")) return;

    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/admin/cash-sessions/${sessionId}`, {
        method: "PUT",
        body: JSON.stringify({
          closing_cash: Number(closingCash),
          notes: notes || null,
        }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la fermeture.");
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-sm text-red-400">{error}</p> : <p className="text-sm text-white/40">Chargement…</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/sessions-caisse" className="hover:text-white/70">
          Sessions de caisse
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>#{session.id}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Session de caisse #{session.id}</h1>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            session.status === "ouverte"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-white/10 text-white/50"
          }`}
        >
          {STATUS_LABELS[session.status] ?? session.status}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Section title="Informations générales">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Période comptable">{session.period?.name ?? "—"}</Field>
          <Field label="Ouvert par">{session.opener?.name ?? "—"}</Field>
          <Field label="Ouvert le">{formatDate(session.opened_at)}</Field>
          <Field label="Espèces d'ouverture">{formatAmount(session.opening_cash)}</Field>
          <Field label="Fermé par">{session.closer?.name ?? "—"}</Field>
          <Field label="Fermé le">{formatDate(session.closed_at)}</Field>
          <Field label="Espèces de fermeture">{formatAmount(session.closing_cash)}</Field>
          <Field label="Notes">{session.notes ?? "—"}</Field>
        </div>
      </Section>

      {session.status === "ouverte" && (
        <Section title="Fermer la session">
          <form onSubmit={closeSession} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Espèces de fermeture<span className="text-red-400">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
              >
                {busy ? "..." : "Fermer la session"}
              </button>
            </div>
          </form>
        </Section>
      )}

      <button
        onClick={() => router.push("/dashboard/sessions-caisse")}
        className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
      >
        Retour à la liste
      </button>
    </div>
  );
}
