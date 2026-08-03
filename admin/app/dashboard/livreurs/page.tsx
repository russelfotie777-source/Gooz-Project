"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type Livreur = {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
};

export default function LivreursPage() {
  const [livreurs, setLivreurs] = useState<Livreur[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    apiFetch<Paginated<Livreur>>("/admin/users?role=delivery")
      .then((res) => setLivreurs(res.data))
      .catch(() => setError("Impossible de charger les livreurs."));
  }

  useEffect(load, []);

  async function toggleActive(livreur: Livreur) {
    setBusyId(livreur.id);
    try {
      const action = livreur.is_active ? "suspend" : "reactivate";
      await apiFetch(`/admin/users/${livreur.id}/${action}`, { method: "PATCH" });
      setLivreurs(
        (prev) => prev?.map((l) => (l.id === livreur.id ? { ...l, is_active: !l.is_active } : l)) ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'opération.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Livreurs</h1>
        <p className="mt-1 text-sm text-zinc-500">Comptes livreurs affectés aux livraisons.</p>
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
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {livreurs?.map((livreur) => (
              <tr key={livreur.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60">
                <td className="px-5 py-3 font-medium text-zinc-900">{livreur.name}</td>
                <td className="px-5 py-3 text-zinc-600">{livreur.phone}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      livreur.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {livreur.is_active ? "Actif" : "Suspendu"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => toggleActive(livreur)}
                    disabled={busyId === livreur.id}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {livreur.is_active ? "Suspendre" : "Réactiver"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {livreurs?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-zinc-400">Aucun livreur enregistré.</p>
        )}
      </div>
    </div>
  );
}
