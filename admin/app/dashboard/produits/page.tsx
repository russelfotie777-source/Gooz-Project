"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";
import { usePageParam } from "@/lib/usePageParam";
import { Toast } from "@/components/toast";

type Product = {
  id: number;
  name: string;
  reference: string | null;
  is_active: boolean;
  categories: { id: number; name: string }[];
};

export default function ProduitsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Product>["meta"] | null>(null);
  const [page, setPage] = usePageParam();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });
    if (search) query.set("q", search);

    apiFetch<Paginated<Product>>(`/admin/products?${query.toString()}`)
      .then((res) => {
        setProducts(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les produits."));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  async function toggleActive(product: Product) {
    try {
      await apiFetch(`/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      setProducts(
        (prev) => prev?.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)) ?? null
      );
      setToast({
        title: "Statut du produit mis à jour",
        message: `Le produit a été ${!product.is_active ? "activé" : "désactivé"}.`,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev?.filter((p) => p.id !== id) ?? null);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  async function bulkSetActive(active: boolean) {
    setBulkOpen(false);
    const ids = Array.from(selected);
    try {
      await Promise.all(
        ids.map((id) => apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify({ is_active: active }) }))
      );
      setProducts((prev) => prev?.map((p) => (selected.has(p.id) ? { ...p, is_active: active } : p)) ?? null);
      setToast({
        title: "Statut des produits mis à jour",
        message: `${ids.length} produit(s) ${active ? "activé(s)" : "désactivé(s)"}.`,
      });
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour groupée.");
    }
  }

  async function bulkDelete() {
    setBulkOpen(false);
    if (!confirm(`Supprimer ${selected.size} produit(s) ?`)) return;
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => apiFetch(`/products/${id}`, { method: "DELETE" })));
      setProducts((prev) => prev?.filter((p) => !selected.has(p.id)) ?? null);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression groupée.");
    }
  }

  function toggleSelectAll() {
    if (!products) return;
    setSelected((prev) => (prev.size === products.length ? new Set() : new Set(products.map((p) => p.id))));
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
        <span>Produits</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produits</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/produits/create")}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
          >
            <Plus className="h-4 w-4" />
            Ajouter un produit
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
                    onClick={() => bulkSetActive(true)}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-emerald-400 hover:bg-white/5"
                  >
                    Activer la sélection
                  </button>
                  <button
                    onClick={() => bulkSetActive(false)}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-white/60 hover:bg-white/5"
                  >
                    Désactiver la sélection
                  </button>
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
                  checked={Boolean(products?.length) && selected.size === products?.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
              </th>
              <th className="px-5 py-3 font-medium">Titre</th>
              <th className="px-5 py-3 font-medium">Catégorie</th>
              <th className="px-5 py-3 font-medium">Actif</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5"
                  />
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{product.name}</p>
                  {product.reference && <p className="text-xs text-white/40">{product.reference}</p>}
                </td>
                <td className="px-5 py-3 text-white/60">
                  {product.categories.length > 0 ? product.categories.map((c) => c.name).join(", ") : "—"}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(product)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      product.is_active ? "bg-brand-orange" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        product.is_active ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === product.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-40 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/produits/${product.id}/edit`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            deleteProduct(product.id);
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

        {products?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun produit trouvé.</p>
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
