"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Brand = {
  id: number;
  name: string;
  description: string | null;
  country_origin: string | null;
};

export default function MarquesPage() {
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Brand[] }>("/brands")
      .then((res) => setBrands(res.data))
      .catch(() => setError("Impossible de charger les marques."));
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Marques</h1>
        <p className="mt-1 text-sm text-zinc-500">Marques actives référencées dans le catalogue.</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands?.map((brand) => (
          <div key={brand.id} className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            <p className="font-semibold text-zinc-900">{brand.name}</p>
            {brand.country_origin && <p className="mt-0.5 text-xs text-zinc-400">{brand.country_origin}</p>}
            {brand.description && <p className="mt-2 text-sm text-zinc-500">{brand.description}</p>}
          </div>
        ))}
      </div>

      {brands?.length === 0 && (
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-zinc-400">Aucune marque.</p>
        </div>
      )}
    </div>
  );
}
