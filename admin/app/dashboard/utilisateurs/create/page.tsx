"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type StaffRole = "super_admin" | "manager" | "staff" | "stagiaire" | "comptable" | "delivery";

const ROLES: { value: StaffRole; label: string }[] = [
  { value: "stagiaire", label: "Stagiaire" },
  { value: "staff", label: "Staff" },
  { value: "manager", label: "Manager" },
  { value: "comptable", label: "Comptable" },
  { value: "delivery", label: "Driver" },
  { value: "super_admin", label: "Super admin" },
];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60";

export default function CreateUtilisateurPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent, andAddAnother: boolean) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ name, phone, password, role }),
      });
      if (andAddAnother) {
        setName("");
        setPhone("");
        setPassword("");
      } else {
        router.push("/dashboard/utilisateurs");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création de l'utilisateur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/utilisateurs" className="hover:text-white/70">
          Utilisateurs
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Créer</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ajouter un utilisateur</h1>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-2xl">
        <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Nom</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Rôle</label>
              <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className={inputClass}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-[#12141c]">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Téléphone</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237699000000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Mot de passe</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

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
            onClick={(e) => handleSubmit(e, true)}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 disabled:opacity-50"
          >
            Créer & ajouter un autre
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/utilisateurs")}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
