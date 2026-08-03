"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { apiFetch, Paginated } from "@/lib/api";
import { Pager } from "@/components/pager";

type Product = {
  id: number;
  name: string;
  reference: string | null;
  base_price: number;
  promo_price: number | null;
  is_active: boolean;
  is_promotion: boolean;
  brand: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
};

function formatXAF(value: number): string {
  return `${Number(value).toLocaleString("fr-FR")} XAF`;
}

export default function ProduitsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Product>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = new URLSearchParams({ page: String(page), per_page: "20" });
      if (search) query.set("q", search);

      apiFetch<Paginated<Product>>(`/products?${query.toString()}`)
        .then((res) => {
          setProducts(res.data);
          setMeta(res.meta);
        })
        .catch(() => setError("Impossible de charger les produits."));
    }, search ? 300 : 0);

    return () => clearTimeout(timeout);
  }, [page, search]);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Produits</h1>
          <p className="mt-1 text-sm text-zinc-500">Catalogue de la boutique.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Nom ou référence..."
            className="w-64 rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-orange/60"
          />
        </div>
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
              <th className="px-5 py-3 font-medium">Produit</th>
              <th className="px-5 py-3 font-medium">Catégorie</th>
              <th className="px-5 py-3 font-medium">Marque</th>
              <th className="px-5 py-3 font-medium">Prix</th>
              <th className="px-5 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60">
                <td className="px-5 py-3">
                  <p className="font-medium text-zinc-900">{product.name}</p>
                  {product.reference && <p className="text-xs text-zinc-400">{product.reference}</p>}
                </td>
                <td className="px-5 py-3 text-zinc-500">{product.category?.name ?? "—"}</td>
                <td className="px-5 py-3 text-zinc-500">{product.brand?.name ?? "—"}</td>
                <td className="px-5 py-3">
                  {product.is_promotion && product.promo_price ? (
                    <span>
                      <span className="text-brand-orange font-medium">{formatXAF(product.promo_price)}</span>{" "}
                      <span className="text-xs text-zinc-400 line-through">{formatXAF(product.base_price)}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-900">{formatXAF(product.base_price)}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {product.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-zinc-400">Aucun produit trouvé.</p>
        )}

        {meta && (
          <div className="px-5 py-4">
            <Pager page={meta.current_page} lastPage={meta.last_page} total={meta.total} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
