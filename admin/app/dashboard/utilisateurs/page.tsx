"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type StaffUser = {
  id: number;
  name: string;
  phone: string;
  role: "admin" | "delivery" | "customer";
  is_active: boolean;
};

const ROLES = ["admin", "delivery"] as const;

export default function UtilisateursPage() {
  const [users, setUsers] = useState<StaffUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<Paginated<StaffUser>>("/admin/users?role=admin&page=1"),
      apiFetch<Paginated<StaffUser>>("/admin/users?role=delivery&page=1"),
    ])
      .then(([admins, delivery]) => setUsers([...admins.data, ...delivery.data]))
      .catch(() => setError("Impossible de charger les utilisateurs."));
  }, []);

  async function changeRole(user: StaffUser, role: string) {
    setBusyId(user.id);
    try {
      await apiFetch(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setUsers(
        (prev) =>
          prev?.map((u) => (u.id === user.id ? { ...u, role: role as StaffUser["role"] } : u)) ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour du rôle.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Utilisateurs</h1>
        <p className="mt-1 text-sm text-zinc-500">Comptes administrateurs et livreurs de la plateforme.</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-400">
              <th className="px-5 py-3 font-medium">Nom</th>
              <th className="px-5 py-3 font-medium">Téléphone</th>
              <th className="px-5 py-3 font-medium">Rôle</th>
              <th className="px-5 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60">
                <td className="px-5 py-3 font-medium text-zinc-900">{user.name}</td>
                <td className="px-5 py-3 text-zinc-600">{user.phone}</td>
                <td className="px-5 py-3">
                  <select
                    value={user.role}
                    disabled={busyId === user.id}
                    onChange={(e) => changeRole(user, e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium capitalize text-zinc-700 outline-none focus:border-brand-orange/60"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active ? "Actif" : "Suspendu"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-zinc-400">Aucun utilisateur.</p>
        )}
      </div>
    </div>
  );
}
