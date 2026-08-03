"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";
import { Pager } from "@/components/pager";

type Client = {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Client>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page), role: "customer" });
    if (search) query.set("q", search);

    apiFetch<Paginated<Client>>(`/admin/users?${query.toString()}`)
      .then((res) => {
        setClients(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les clients."));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  async function toggleActive(client: Client) {
    setBusyId(client.id);
    try {
      const action = client.is_active ? "suspend" : "reactivate";
      await apiFetch(`/admin/users/${client.id}/${action}`, { method: "PATCH" });
      setClients(
        (prev) => prev?.map((c) => (c.id === client.id ? { ...c, is_active: !c.is_active } : c)) ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'opération.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Clients</h1>
          <p className="mt-1 text-sm text-zinc-500">Comptes clients enregistrés sur la boutique.</p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Nom ou téléphone..."
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
              <th className="px-5 py-3 font-medium">Nom</th>
              <th className="px-5 py-3 font-medium">Téléphone</th>
              <th className="px-5 py-3 font-medium">Inscrit le</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60">
                <td className="px-5 py-3 font-medium text-zinc-900">{client.name}</td>
                <td className="px-5 py-3 text-zinc-600">{client.phone}</td>
                <td className="px-5 py-3 text-zinc-400">
                  {new Date(client.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      client.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {client.is_active ? "Actif" : "Suspendu"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => toggleActive(client)}
                    disabled={busyId === client.id}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {client.is_active ? "Suspendre" : "Réactiver"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-zinc-400">Aucun client trouvé.</p>
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
