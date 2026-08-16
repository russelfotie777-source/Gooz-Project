"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Eye, MoreVertical, Plus, Search, UserMinus } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type Livreur = {
  id: number;
  name: string;
  phone: string;
  status: "active" | "restricted" | "blocked" | "silently_blocked";
  phone_verified_at: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  restricted: "Restreint",
  blocked: "Bloqué",
  silently_blocked: "Bloqué (silencieux)",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  restricted: "bg-amber-500/10 text-amber-400",
  blocked: "bg-red-500/10 text-red-400",
  silently_blocked: "bg-red-500/10 text-red-400",
};

export default function LivreursPage() {
  const router = useRouter();
  const [livreurs, setLivreurs] = useState<Livreur[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    const query = new URLSearchParams({ role: "delivery", per_page: "50" });
    if (search) query.set("q", search);

    apiFetch<Paginated<Livreur>>(`/admin/users?${query.toString()}`)
      .then((res) => setLivreurs(res.data))
      .catch(() => setError("Impossible de charger les livreurs."));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function removeDriverRole(livreur: Livreur) {
    if (!confirm(`Retirer le rôle livreur à ${livreur.name} ? Le compte redevient un compte client.`)) return;
    setBusyId(livreur.id);
    try {
      await apiFetch(`/admin/users/${livreur.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: "customer" }),
      });
      setLivreurs((prev) => prev?.filter((l) => l.id !== livreur.id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'opération.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Livreurs</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Livreurs</h1>
          <p className="mt-1 text-sm text-white/40">Comptes livreurs affectés aux livraisons.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/livreurs/ajouter")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Ajouter un livreur
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 p-4">
          <span />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom ou téléphone..."
              className="w-64 rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Nom du livreur</th>
              <th className="px-5 py-3 font-medium">Téléphone</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Téléphone vérifié</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {livreurs?.map((livreur) => (
              <tr key={livreur.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-medium text-white">{livreur.name}</td>
                <td className="px-5 py-3 text-white/60">{livreur.phone}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      STATUS_COLORS[livreur.status] ?? "bg-white/5 text-white/50"
                    }`}
                  >
                    {STATUS_LABELS[livreur.status] ?? livreur.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/60">{livreur.phone_verified_at ? "Oui" : "Non"}</td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === livreur.id ? null : livreur.id)}
                    disabled={busyId === livreur.id}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-50"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === livreur.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-52 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/livreurs/${livreur.id}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            removeDriverRole(livreur);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                        >
                          <UserMinus className="h-4 w-4" />
                          Retirer le rôle livreur
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {livreurs?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun livreur enregistré.</p>
        )}
      </div>
    </div>
  );
}
