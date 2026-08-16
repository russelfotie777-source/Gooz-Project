"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type CityOption = { id: number; name: string };

type Neighborhood = {
  id: number;
  city: { id: number; name: string } | null;
  name: string;
  latitude: string;
  longitude: string;
};

export default function QuartiersLivraisonPage() {
  const router = useRouter();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Neighborhood>["meta"] | null>(null);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ data: CityOption[] }>("/cities")
      .then((res) => setCities(res.data))
      .catch(() => {});
  }, []);

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });
    if (search) query.set("q", search);
    if (cityId) query.set("city_id", cityId);

    apiFetch<Paginated<Neighborhood>>(`/admin/neighborhoods?${query.toString()}`)
      .then((res) => {
        setNeighborhoods(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les quartiers."));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, cityId]);

  async function deleteNeighborhood(id: number) {
    if (!confirm("Supprimer ce quartier ?")) return;
    try {
      await apiFetch(`/admin/neighborhoods/${id}`, { method: "DELETE" });
      setNeighborhoods((prev) => prev?.filter((n) => n.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Quartiers de livraison</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quartiers de livraison</h1>
          <p className="mt-1 text-sm text-white/40">
            Points de repère (ville + coordonnées) utilisés pour estimer les frais de livraison.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/quartiers-livraison/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Créer
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 p-4">
          <select
            value={cityId}
            onChange={(e) => {
              setPage(1);
              setCityId(e.target.value);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
          >
            <option value="" className="bg-[#12141c]">
              Toutes les villes
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#12141c]">
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Rechercher un quartier..."
              className="w-64 rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Ville</th>
              <th className="px-5 py-3 font-medium">Quartier</th>
              <th className="px-5 py-3 font-medium">Latitude</th>
              <th className="px-5 py-3 font-medium">Longitude</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {neighborhoods?.map((n) => (
              <tr key={n.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-white/60">{n.city?.name ?? "—"}</td>
                <td className="px-5 py-3 font-medium text-white">{n.name}</td>
                <td className="px-5 py-3 text-white/60">{n.latitude}</td>
                <td className="px-5 py-3 text-white/60">{n.longitude}</td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === n.id ? null : n.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === n.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/quartiers-livraison/${n.id}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        <Link
                          href={`/dashboard/quartiers-livraison/${n.id}/edit`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            deleteNeighborhood(n.id);
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

        {neighborhoods?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun quartier trouvé.</p>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-5 py-4">
            <p className="text-xs text-white/30">{meta.total} résultat{meta.total > 1 ? "s" : ""}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-white/60">
                {meta.current_page} / {meta.last_page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.last_page}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
