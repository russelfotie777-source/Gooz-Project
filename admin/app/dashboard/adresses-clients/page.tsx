"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, XCircle } from "lucide-react";
import { CheckCircle2, Eye } from "lucide-react";
import { apiFetch, Paginated } from "@/lib/api";

type AddressRow = {
  id: number;
  customer_name: string | null;
  label: string | null;
  recipient_name: string;
  recipient_phone: string;
  ville: string;
  is_default: boolean;
};

export default function AdressesClientsPage() {
  const [addresses, setAddresses] = useState<AddressRow[] | null>(null);
  const [meta, setMeta] = useState<Paginated<AddressRow>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = new URLSearchParams({ page: String(page) });
      if (search) query.set("q", search);

      apiFetch<Paginated<AddressRow>>(`/admin/addresses?${query.toString()}`)
        .then((res) => {
          setAddresses(res.data);
          setMeta(res.meta);
        })
        .catch(() => setError("Impossible de charger les adresses."));
    }, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [page, search]);

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Adresses clients</h1>
          <p className="mt-1 text-sm text-white/40">Carnet d&apos;adresses enregistré par les clients.</p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Nom, téléphone ou ville..."
            className="w-64 rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
          />
        </div>
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
              <th className="px-5 py-3 font-medium">Téléphone</th>
              <th className="px-5 py-3 font-medium">Ville</th>
              <th className="px-5 py-3 font-medium">Par défaut</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses?.map((address) => (
              <tr key={address.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{address.recipient_name}</p>
                  <p className="text-xs text-white/40">
                    {address.label ?? "—"} · Client : {address.customer_name ?? "—"}
                  </p>
                </td>
                <td className="px-5 py-3 text-white/60">{address.recipient_phone}</td>
                <td className="px-5 py-3 text-white/60">{address.ville}</td>
                <td className="px-5 py-3">
                  {address.is_default ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400/70" />
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/dashboard/adresses-clients/${address.id}`}
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

        {addresses?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucune adresse trouvée.</p>
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
