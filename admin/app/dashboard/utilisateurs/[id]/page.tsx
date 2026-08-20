"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type StaffRole = "customer" | "admin" | "super_admin" | "manager" | "staff" | "stagiaire" | "delivery";

type StaffUser = {
  id: number;
  name: string;
  phone: string;
  phone_verified_at: string | null;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
};

const ROLES: { value: StaffRole; label: string }[] = [
  { value: "stagiaire", label: "Stagiaire" },
  { value: "staff", label: "Staff" },
  { value: "manager", label: "Manager" },
  { value: "delivery", label: "Driver" },
  { value: "super_admin", label: "Super admin" },
];

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

export default function UtilisateurDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = useState<StaffUser | null>(null);
  const [roleValue, setRoleValue] = useState<StaffRole | "">("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch<{ data: StaffUser }>(`/admin/users/${userId}`)
      .then((res) => {
        setUser(res.data);
        setRoleValue(res.data.role);
      })
      .catch(() => setError("Impossible de charger cet utilisateur."));
  }

  useEffect(load, [userId]);

  async function updateRole() {
    if (!user || !roleValue) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: roleValue }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour du rôle.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/admin/users/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: user.is_active ? "blocked" : "active" }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour du statut.");
    } finally {
      setBusy(false);
    }
  }

  async function removeUser() {
    if (!user) return;
    if (!confirm(`Supprimer le compte de ${user.name} ?`)) return;
    setBusy(true);
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: "DELETE" });
      router.push("/dashboard/utilisateurs");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-sm text-red-400">{error}</p> : <p className="text-sm text-white/40">Chargement…</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/utilisateurs" className="hover:text-white/70">
          Utilisateurs
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{user.name}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            user.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {user.is_active ? "Actif" : "Suspendu"}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Section title="Aperçu">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Téléphone">{user.phone}</Field>
          <Field label="Téléphone vérifié">{user.phone_verified_at ? formatDate(user.phone_verified_at) : "Non"}</Field>
          <Field label="Créé le">{formatDate(user.created_at)}</Field>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Section title="Rôle">
          <div className="flex items-center gap-3">
            <select
              value={roleValue}
              onChange={(e) => setRoleValue(e.target.value as StaffRole)}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-[#12141c]">
                  {r.label}
                </option>
              ))}
            </select>
            <button
              onClick={updateRole}
              disabled={busy || roleValue === user.role}
              className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
            >
              Mettre à jour
            </button>
          </div>
        </Section>

        <Section title="Statut du compte">
          <button
            onClick={toggleActive}
            disabled={busy}
            className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
              user.is_active
                ? "border border-red-500/20 text-red-400 hover:bg-red-500/10"
                : "bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white shadow-lg shadow-brand-orange/20"
            }`}
          >
            {user.is_active ? "Suspendre le compte" : "Réactiver le compte"}
          </button>
        </Section>
      </div>

      <button
        onClick={removeUser}
        disabled={busy}
        className="flex items-center gap-2 rounded-lg border border-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        Supprimer cet utilisateur
      </button>
    </div>
  );
}
