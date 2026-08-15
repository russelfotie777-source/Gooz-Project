"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Eye, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Warehouse = {
  id: number;
  name: string;
  type: string;
  code: string | null;
  ville: string;
  region: string;
  quartier: string | null;
  is_active: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  entrepot: "Entrepôt",
  boutique: "Boutique",
};

export default function EntrepotsPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  function load() {
    apiFetch<{ data: Warehouse[] }>("/admin/warehouses")
      .then((res) => setWarehouses(res.data))
      .catch(() => setError("Impossible de charger les emplacements."));
  }

  useEffect(load, []);

  async function toggleActive(warehouse: Warehouse) {
    try {
      await apiFetch(`/admin/warehouses/${warehouse.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !warehouse.is_active }),
      });
      setWarehouses(
        (prev) => prev?.map((w) => (w.id === warehouse.id ? { ...w, is_active: !w.is_active } : w)) ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    }
  }

  async function deleteWarehouse(id: number) {
    if (!confirm("Supprimer cet emplacement ?")) return;
    try {
      await apiFetch(`/admin/warehouses/${id}`, { method: "DELETE" });
      setWarehouses((prev) => prev?.filter((w) => w.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Emplacements</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Emplacements</h1>
          <p className="mt-1 text-sm text-white/40">Entrepôts et boutiques utilisés pour le retrait et la livraison.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/entrepots/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Ajouter un emplacement
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
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Ville</th>
              <th className="px-5 py-3 font-medium">Adresse</th>
              <th className="px-5 py-3 font-medium">Actif</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses?.map((warehouse) => (
              <tr key={warehouse.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{warehouse.name}</p>
                  {warehouse.code && <p className="text-xs text-white/40">{warehouse.code}</p>}
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
                    {TYPE_LABELS[warehouse.type] ?? warehouse.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">
                  {warehouse.ville}, {warehouse.region}
                </td>
                <td className="px-5 py-3 text-white/60">{warehouse.quartier ?? "—"}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(warehouse)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      warehouse.is_active ? "bg-brand-orange" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        warehouse.is_active ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === warehouse.id ? null : warehouse.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === warehouse.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/entrepots/${warehouse.id}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        <Link
                          href={`/dashboard/entrepots/${warehouse.id}/edit`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            deleteWarehouse(warehouse.id);
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

        {warehouses?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun emplacement.</p>
        )}
      </div>
    </div>
  );
}
