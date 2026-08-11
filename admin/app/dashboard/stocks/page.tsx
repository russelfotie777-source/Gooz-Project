"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { apiFetch, Paginated } from "@/lib/api";

type StockRow = {
  id: number;
  product: { id: number; name: string } | null;
  variant: { id: number; display_name: string | null } | null;
  warehouse: { id: number; name: string } | null;
  quantity_available: number;
  quantity_reserved: number;
};

export default function StocksPage() {
  const [stocks, setStocks] = useState<StockRow[] | null>(null);
  const [meta, setMeta] = useState<Paginated<StockRow>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = new URLSearchParams({ page: String(page), per_page: "25" });
      if (search) query.set("q", search);

      apiFetch<Paginated<StockRow>>(`/admin/stocks?${query.toString()}`)
        .then((res) => {
          setStocks(res.data);
          setMeta(res.meta);
        })
        .catch(() => setError("Impossible de charger les stocks."));
    }, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [page, search]);

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Stocks</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Stocks</h1>
        <p className="mt-1 text-sm text-white/40">
          Consultation des quantités par emplacement. L&apos;ajustement se fait depuis « Ajustement de stock ».
        </p>
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
              placeholder="Produit ou SKU..."
              className="w-64 rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Produit</th>
              <th className="px-5 py-3 font-medium">Variante</th>
              <th className="px-5 py-3 font-medium">Emplacement</th>
              <th className="px-5 py-3 font-medium">En stock</th>
              <th className="px-5 py-3 font-medium">Réservé</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks?.map((stock) => (
              <tr key={stock.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-white">{stock.product?.name ?? "—"}</td>
                <td className="px-5 py-3 text-white/60">{stock.variant?.display_name ?? "—"}</td>
                <td className="px-5 py-3 text-white/60">{stock.warehouse?.name ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                    {stock.quantity_available}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      stock.quantity_reserved > 0
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {stock.quantity_reserved}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/dashboard/stocks/${stock.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {stocks?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun stock trouvé.</p>
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
