"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Warehouse = {
  id: number;
  name: string;
  region: string;
  ville: string;
  quartier: string | null;
  phone: string | null;
  is_active: boolean;
};

export default function EntrepotsPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Warehouse[] }>("/warehouses")
      .then((res) => setWarehouses(res.data))
      .catch(() => setError("Impossible de charger les entrepôts."));
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Emplacements</h1>
        <p className="mt-1 text-sm text-zinc-500">Entrepôts utilisés pour le retrait et la livraison.</p>
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
              <th className="px-5 py-3 font-medium">Ville</th>
              <th className="px-5 py-3 font-medium">Quartier</th>
              <th className="px-5 py-3 font-medium">Téléphone</th>
              <th className="px-5 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {warehouses?.map((w) => (
              <tr key={w.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60">
                <td className="px-5 py-3 font-medium text-zinc-900">{w.name}</td>
                <td className="px-5 py-3 text-zinc-500">
                  {w.ville}, {w.region}
                </td>
                <td className="px-5 py-3 text-zinc-500">{w.quartier ?? "—"}</td>
                <td className="px-5 py-3 text-zinc-500">{w.phone ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      w.is_active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {w.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {warehouses?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-zinc-400">Aucun entrepôt.</p>
        )}
      </div>
    </div>
  );
}
