"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type Account = {
  id: number;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  is_active: boolean;
  balance: string | null;
};

const TYPE_TABS: { value: string; label: string }[] = [
  { value: "", label: "Tous" },
  { value: "asset", label: "Actifs" },
  { value: "liability", label: "Passifs" },
  { value: "equity", label: "Capitaux propres" },
  { value: "revenue", label: "Produits" },
  { value: "expense", label: "Charges" },
];

const TYPE_LABELS: Record<string, string> = {
  asset: "asset",
  liability: "liability",
  equity: "equity",
  revenue: "revenue",
  expense: "expense",
};

export default function ComptesPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Account>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });
    if (type) query.set("type", type);

    apiFetch<Paginated<Account>>(`/admin/accounts?${query.toString()}`)
      .then((res) => {
        setAccounts(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les comptes."));
  }

  useEffect(load, [page, type]);

  async function toggleActive(account: Account) {
    setBusyId(account.id);
    try {
      await apiFetch(`/admin/accounts/${account.id}`, {
        method: "PUT",
        body: JSON.stringify({
          code: account.code,
          name: account.name,
          type: account.type,
          is_active: !account.is_active,
        }),
      });
      setAccounts((prev) =>
        prev?.map((a) => (a.id === account.id ? { ...a, is_active: !a.is_active } : a)) ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAccount(id: number) {
    if (!confirm("Supprimer ce compte ?")) return;
    try {
      await apiFetch(`/admin/accounts/${id}`, { method: "DELETE" });
      setAccounts((prev) => prev?.filter((a) => a.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Comptes</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Comptes</h1>
        <button
          onClick={() => router.push("/dashboard/comptes/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Créer
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setPage(1);
              setType(tab.value);
            }}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              type === tab.value
                ? "bg-white/10 text-white"
                : "text-white/40 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Nom</th>
              <th className="px-5 py-3 font-medium">Solde actuel</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Actif</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts?.map((account) => (
              <tr key={account.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-white/60">{account.id}</td>
                <td className="px-5 py-3 font-mono text-xs text-white">{account.code}</td>
                <td className="px-5 py-3 font-medium text-white">{account.name}</td>
                <td className="px-5 py-3 text-white/30">
                  {account.balance ?? "Aucune transaction comptabilisée pour le moment"}
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                    {TYPE_LABELS[account.type] ?? account.type}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(account)}
                    disabled={busyId === account.id}
                    className={`relative h-5 w-9 rounded-full transition disabled:opacity-50 ${
                      account.is_active ? "bg-brand-orange" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                        account.is_active ? "left-4" : "left-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/dashboard/comptes/${account.id}`}
                      className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteAccount(account.id)}
                      className="rounded-lg p-2 text-red-400 hover:bg-white/5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {accounts?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucun compte.</p>
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
