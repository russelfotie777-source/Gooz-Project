"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  is_active: boolean;
  updated_at: string;
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "il y a 1 jour";
  if (days < 7) return `il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "il y a 1 semaine";
  if (weeks < 5) return `il y a ${weeks} semaines`;
  const months = Math.floor(days / 30);
  return months <= 1 ? "il y a 1 mois" : `il y a ${months} mois`;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Category>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (search) query.set("q", search);

    apiFetch<Paginated<Category>>(`/admin/categories?${query.toString()}`)
      .then((res) => {
        setCategories(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les catégories."));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, search]);

  async function toggleActive(category: Category) {
    try {
      await apiFetch(`/categories/${category.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !category.is_active }),
      });
      setCategories(
        (prev) => prev?.map((c) => (c.id === category.id ? { ...c, is_active: !c.is_active } : c)) ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev?.filter((c) => c.id !== id) ?? null);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  async function deleteSelected() {
    if (!confirm(`Supprimer ${selected.size} catégorie(s) ?`)) return;
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => apiFetch(`/categories/${id}`, { method: "DELETE" })));
      setCategories((prev) => prev?.filter((c) => !selected.has(c.id)) ?? null);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression groupée.");
    }
  }

  function toggleSelectAll() {
    if (!categories) return;
    setSelected((prev) => (prev.size === categories.length ? new Set() : new Set(categories.map((c) => c.id))));
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const from = meta ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const to = meta ? Math.min(meta.current_page * meta.per_page, meta.total) : 0;

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Catégories</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <button
          onClick={() => router.push("/dashboard/categories/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Ajouter une catégorie
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 p-4">
          {selected.size > 0 ? (
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span>{selected.size} sélectionné(s)</span>
              <button
                onClick={deleteSelected}
                className="flex items-center gap-1.5 rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-medium text-white hover:brightness-105"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
            </div>
          ) : (
            <span />
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Rechercher"
              className="w-64 rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="w-10 px-5 py-3">
                <input
                  type="checkbox"
                  checked={Boolean(categories?.length) && selected.size === categories?.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
              </th>
              <th className="px-5 py-3 font-medium">Nom</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Actif</th>
              <th className="px-5 py-3 font-medium">Mis à jour</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((category) => (
              <tr key={category.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(category.id)}
                    onChange={() => toggleSelect(category.id)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5"
                  />
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{category.name}</p>
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-md bg-amber-500/10 px-2 py-1 font-mono text-xs text-amber-400">
                    {category.slug}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(category)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      category.is_active ? "bg-brand-orange" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        category.is_active ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3 text-white/40">{relativeTime(category.updated_at)}</td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === category.id ? null : category.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === category.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/categories/${category.id}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        <Link
                          href={`/dashboard/categories/${category.id}/edit`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            deleteCategory(category.id);
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

        {categories?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucune catégorie.</p>
        )}

        {meta && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-4">
            <p className="text-xs text-white/30">
              Affichage de {from} à {to} sur {meta.total} résultats
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-white/40">
                par page
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPage(1);
                    setPerPage(Number(e.target.value));
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
                >
                  {PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n} className="bg-[#12141c]">
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              {meta.last_page > 1 && (
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
