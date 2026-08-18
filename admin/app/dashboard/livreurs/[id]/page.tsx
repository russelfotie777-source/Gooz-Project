"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, UserMinus } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type StatusHistory = {
  id: number;
  from_status: string;
  to_status: string;
  reason: string | null;
  changed_by: string | null;
  created_at: string;
};

type Livreur = {
  id: number;
  name: string;
  phone: string;
  phone_verified_at: string | null;
  role: string;
  status: "active" | "restricted" | "blocked" | "silently_blocked";
  status_reason: string | null;
  created_at: string;
  orders_count: number;
  tickets_count: number;
  status_histories: StatusHistory[];
};

const STATUS_OPTIONS = [
  { value: "active", label: "Actif" },
  { value: "restricted", label: "Restreint" },
  { value: "blocked", label: "Bloqué" },
  { value: "silently_blocked", label: "Bloqué (silencieux)" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  restricted: "bg-amber-500/10 text-amber-400",
  blocked: "bg-red-500/10 text-red-400",
  silently_blocked: "bg-red-500/10 text-red-400",
};

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

export default function LivreurDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const livreurId = Number(params.id);

  const [livreur, setLivreur] = useState<Livreur | null>(null);
  const [newStatus, setNewStatus] = useState("active");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch<{ data: Livreur }>(`/admin/users/${livreurId}`)
      .then((res) => {
        setLivreur(res.data);
        setNewStatus(res.data.status);
      })
      .catch(() => setError("Impossible de charger ce livreur."));
  }

  useEffect(load, [livreurId]);

  async function updateStatus(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/admin/users/${livreurId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, reason: reason || null }),
      });
      setReason("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour du statut.");
    } finally {
      setBusy(false);
    }
  }

  async function removeDriverRole() {
    if (!livreur) return;
    if (!confirm(`Retirer le rôle livreur à ${livreur.name} ? Le compte redevient un compte client.`)) return;
    setBusy(true);
    try {
      await apiFetch(`/admin/users/${livreurId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: "customer" }),
      });
      router.push("/dashboard/livreurs");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'opération.");
      setBusy(false);
    }
  }

  if (!livreur) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/livreurs" className="hover:text-white/70">
          Livreurs
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Voir</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{livreur.name}</h1>
        <button
          onClick={removeDriverRole}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        >
          <UserMinus className="h-4 w-4" />
          Retirer le rôle livreur
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Section title="Informations">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Téléphone">{livreur.phone}</Field>
          <Field label="Téléphone vérifié">{livreur.phone_verified_at ? "Oui" : "Non"}</Field>
          <Field label="Statut">
            <span className={`rounded-md px-2 py-1 text-xs font-medium ${STATUS_COLORS[livreur.status]}`}>
              {STATUS_OPTIONS.find((s) => s.value === livreur.status)?.label ?? livreur.status}
            </span>
          </Field>
          <Field label="Commandes">{livreur.orders_count}</Field>
          <Field label="Tickets">{livreur.tickets_count}</Field>
          <Field label="Compte créé le">{formatDate(livreur.created_at)}</Field>
        </div>
      </Section>

      <Section title="Changer le statut">
        <form onSubmit={updateStatus} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm text-white/70">Nouveau statut</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#12141c]">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm text-white/70">Motif (optionnel)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ex: Signalement client"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
            />
          </div>
          <button
            type="submit"
            disabled={busy || newStatus === livreur.status}
            className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
          >
            {busy ? "..." : "Appliquer"}
          </button>
        </form>
      </Section>

      <Section title="Historique des statuts">
        {livreur.status_histories.length === 0 ? (
          <p className="text-sm text-white/30">Aucun changement de statut enregistré.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
                <th className="px-3 py-2 font-medium">De</th>
                <th className="px-3 py-2 font-medium">Vers</th>
                <th className="px-3 py-2 font-medium">Motif</th>
                <th className="px-3 py-2 font-medium">Par</th>
                <th className="px-3 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {livreur.status_histories.map((h) => (
                <tr key={h.id} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2.5 text-white/60">{h.from_status}</td>
                  <td className="px-3 py-2.5 text-white">{h.to_status}</td>
                  <td className="px-3 py-2.5 text-white/60">{h.reason ?? "—"}</td>
                  <td className="px-3 py-2.5 text-white/60">{h.changed_by ?? "—"}</td>
                  <td className="px-3 py-2.5 text-white/60">{formatDate(h.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}
