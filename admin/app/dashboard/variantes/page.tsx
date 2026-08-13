"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageOff,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";
import { Toast } from "@/components/toast";

type Variant = {
  id: number;
  product_name: string | null;
  display_name: string | null;
  price: number;
  is_active: boolean;
  images_count: number;
};

function formatXAF(value: number): string {
  return `${Number(value).toLocaleString("fr-FR")} XAF`;
}

export default function VariantesPage() {
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Variant>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });
    if (search) query.set("q", search);

    apiFetch<Paginated<Variant>>(`/admin/variants?${query.toString()}`)
      .then((res) => {
        setVariants(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les variantes."));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  async function toggleActive(variant: Variant) {
    try {
      await apiFetch(`/variants/${variant.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !variant.is_active }),
      });
      setVariants(
        (prev) => prev?.map((v) => (v.id === variant.id ? { ...v, is_active: !v.is_active } : v)) ?? null
      );
      setToast({
        title: "Statut de la variante mis à jour",
        message: `La variante a été ${!variant.is_active ? "activée" : "désactivée"}.`,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    }
  }

  async function deleteVariant(id: number) {
    if (!confirm("Supprimer cette variante ?")) return;
    try {
      await apiFetch(`/variants/${id}`, { method: "DELETE" });
      setVariants((prev) => prev?.filter((v) => v.id !== id) ?? null);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  async function bulkDelete() {
    setBulkOpen(false);
    if (!confirm(`Supprimer ${selected.size} variante(s) ?`)) return;
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => apiFetch(`/variants/${id}`, { method: "DELETE" })));
      setVariants((prev) => prev?.filter((v) => !selected.has(v.id)) ?? null);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression groupée.");
    }
  }

  function toggleSelectAll() {
    if (!variants) return;
    setSelected((prev) => (prev.size === variants.length ? new Set() : new Set(variants.map((v) => v.id))));
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}

      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Variantes de produit</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Variantes de produit</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/variantes/create")}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
          >
            <Plus className="h-4 w-4" />
            Ajouter une variante
          </button>
          <div className="relative">
            <button
              onClick={() => setBulkOpen((v) => !v)}
              disabled={selected.size === 0}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MoreVertical className="h-4 w-4" />
              Bulk Actions
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {bulkOpen && selected.size > 0 && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBulkOpen(false)} />
                <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                  <button
                    onClick={bulkDelete}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer la sélection
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="flex items-center justify-end border-b border-white/5 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Rechercher un produit"
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
                  checked={Boolean(variants?.length) && selected.size === variants?.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
              </th>
              <th className="px-5 py-3 font-medium">Produit</th>
              <th className="px-5 py-3 font-medium">Nom de variante</th>
              <th className="px-5 py-3 font-medium">Images</th>
              <th className="px-5 py-3 font-medium">Prix</th>
              <th className="px-5 py-3 font-medium">Actif</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants?.map((variant) => (
              <tr key={variant.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(variant.id)}
                    onChange={() => toggleSelect(variant.id)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5"
                  />
                </td>
                <td className="px-5 py-3 text-white/80">{variant.product_name ?? "—"}</td>
                <td className="px-5 py-3 font-medium text-white">{variant.display_name ?? "—"}</td>
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/variantes/${variant.id}/edit`}
                    className={`inline-flex items-center gap-1.5 text-sm hover:underline ${
                      variant.images_count > 0 ? "text-brand-blue" : "text-white/30"
                    }`}
                  >
                    {variant.images_count === 0 && <ImageOff className="h-3.5 w-3.5" />}
                    {variant.images_count} image{variant.images_count > 1 ? "s" : ""}
                  </Link>
                </td>
                <td className="px-5 py-3 text-white/60">{formatXAF(variant.price)}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(variant)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      variant.is_active ? "bg-brand-orange" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        variant.is_active ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === variant.id ? null : variant.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === variant.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-40 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/variantes/${variant.id}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        <Link
                          href={`/dashboard/variantes/${variant.id}/edit`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            deleteVariant(variant.id);
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

        {variants?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucune variante trouvée.</p>
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
