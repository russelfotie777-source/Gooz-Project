"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Account = {
  id: number;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  is_active: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

const TYPE_OPTIONS = [
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "revenue", label: "Revenue" },
  { value: "expense", label: "Expense" },
];

export default function EditComptePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const accountId = Number(params.id);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Account }>(`/admin/accounts/${accountId}`)
      .then((res) => {
        setCode(res.data.code);
        setName(res.data.name);
        setType(res.data.type);
        setIsActive(res.data.is_active);
      })
      .catch(() => setError("Impossible de charger ce compte."));
  }, [accountId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch(`/admin/accounts/${accountId}`, {
        method: "PUT",
        body: JSON.stringify({ code, name, type, is_active: isActive }),
      });
      router.push("/dashboard/comptes");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce compte ?")) return;
    try {
      await apiFetch(`/admin/accounts/${accountId}`, { method: "DELETE" });
      router.push("/dashboard/comptes");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/comptes" className="hover:text-white/70">
          Comptes
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modifier Compte</h1>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 rounded-lg border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Code<span className="text-red-400">*</span>
              </label>
              <input required value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Nom<span className="text-red-400">*</span>
              </label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Type<span className="text-red-400">*</span>
              </label>
              <select required value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#12141c]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                  isActive ? "bg-brand-orange" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                    isActive ? "left-4" : "left-0.5"
                  }`}
                />
              </button>
              <p className="text-sm text-white/70">Actif</p>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
          >
            {submitting ? "..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/comptes")}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
