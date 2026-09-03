"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Eye, MoreVertical, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type StaffRole = "admin" | "super_admin" | "manager" | "staff" | "stagiaire" | "comptable" | "delivery";

type StaffUser = {
  id: number;
  name: string;
  phone: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
};

const ROLES: StaffRole[] = ["admin", "super_admin", "manager", "staff", "stagiaire", "comptable", "delivery"];

const ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Admin",
  super_admin: "Super admin",
  manager: "Manager",
  staff: "Staff",
  stagiaire: "Stagiaire",
  comptable: "Comptable",
  delivery: "Driver",
};

const ROLE_STYLES: Record<StaffRole, string> = {
  admin: "bg-red-500/10 text-red-400",
  super_admin: "bg-red-500/10 text-red-400",
  manager: "bg-violet-500/10 text-violet-400",
  staff: "bg-sky-500/10 text-sky-400",
  stagiaire: "bg-amber-500/10 text-amber-400",
  comptable: "bg-teal-500/10 text-teal-400",
  delivery: "bg-emerald-500/10 text-emerald-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

export default function UtilisateursPage() {
  const router = useRouter();
  const [users, setUsers] = useState<StaffUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    Promise.all(ROLES.map((role) => apiFetch<Paginated<StaffUser>>(`/admin/users?role=${role}&per_page=50`)))
      .then((results) => setUsers(results.flatMap((r) => r.data)))
      .catch(() => setError("Impossible de charger les utilisateurs."));
  }

  useEffect(load, []);

  async function toggleActive(user: StaffUser) {
    setBusyId(user.id);
    try {
      await apiFetch(`/admin/users/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: user.is_active ? "blocked" : "active" }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour du statut.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser(user: StaffUser) {
    if (!confirm(`Supprimer le compte de ${user.name} ?`)) return;
    setBusyId(user.id);
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Utilisateurs</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="mt-1 text-sm text-white/40">Comptes staff, managers et livreurs de la plateforme.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/utilisateurs/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Nom</th>
              <th className="px-5 py-3 font-medium">Téléphone</th>
              <th className="px-5 py-3 font-medium">Rôle</th>
              <th className="px-5 py-3 font-medium">Actif</th>
              <th className="px-5 py-3 font-medium">Créé le</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-medium text-white">{user.name}</td>
                <td className="px-5 py-3 text-white/60">{user.phone}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-md px-2 py-1 text-xs font-medium ${ROLE_STYLES[user.role]}`}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(user)}
                    disabled={busyId === user.id}
                    className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
                      user.is_active ? "bg-brand-orange" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        user.is_active ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3 text-white/60">{formatDate(user.created_at)}</td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === user.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/utilisateurs/${user.id}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            removeUser(user);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users?.length === 0 && <p className="px-5 py-10 text-center text-sm text-white/30">Aucun utilisateur.</p>}
      </div>
    </div>
  );
}
