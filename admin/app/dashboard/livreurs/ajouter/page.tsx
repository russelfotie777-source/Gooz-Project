"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type UserResult = {
  id: number;
  name: string;
  phone: string;
  role: "admin" | "delivery" | "customer";
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  delivery: "Déjà livreur",
  customer: "Client",
};

export default function AjouterLivreurPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!search) {
      setResults(null);
      return;
    }
    const timeout = setTimeout(() => {
      apiFetch<Paginated<UserResult>>(`/admin/users?q=${encodeURIComponent(search)}&per_page=20`)
        .then((res) => setResults(res.data))
        .catch(() => setError("Impossible de rechercher les utilisateurs."));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function promote(user: UserResult) {
    setError(null);
    setBusyId(user.id);
    try {
      await apiFetch(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: "delivery" }),
      });
      router.push(`/dashboard/livreurs/${user.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la promotion.");
      setBusyId(null);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/livreurs" className="hover:text-white/70">
          Livreurs
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Ajouter</span>
      </div>

      <h1 className="mb-2 text-2xl font-bold">Ajouter un livreur</h1>
      <p className="mb-6 text-sm text-white/40">
        Un livreur doit d&apos;abord posséder un compte (créé via l&apos;inscription). Recherchez-le
        ci-dessous puis attribuez-lui le rôle livreur.
      </p>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou téléphone..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
          />
        </div>

        {!search && <p className="text-sm text-white/30">Tapez un nom ou un numéro pour rechercher.</p>}

        {results && (
          <div className="flex flex-col divide-y divide-white/5">
            {results.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-white/40">
                    {user.phone} · {ROLE_LABELS[user.role] ?? user.role}
                  </p>
                </div>
                <button
                  onClick={() => promote(user)}
                  disabled={user.role === "delivery" || busyId === user.id}
                  className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {user.role === "delivery" ? "Déjà livreur" : busyId === user.id ? "..." : "Promouvoir en livreur"}
                </button>
              </div>
            ))}

            {results.length === 0 && (
              <p className="py-6 text-center text-sm text-white/30">Aucun utilisateur trouvé.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
