"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type PeriodOption = { id: number; name: string; status: "ouverte" | "fermée" };

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

export default function CreateSessionCaissePage() {
  const router = useRouter();
  const [periods, setPeriods] = useState<PeriodOption[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [openingCash, setOpeningCash] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Paginated<PeriodOption>>("/admin/accounting-periods?status=ouverte&per_page=100")
      .then((res) => {
        setPeriods(res.data);
        if (res.data.length === 1) setPeriodId(String(res.data[0].id));
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const created = await apiFetch<{ data: { id: number } }>("/admin/cash-sessions", {
        method: "POST",
        body: JSON.stringify({
          accounting_period_id: Number(periodId),
          opening_cash: Number(openingCash),
        }),
      });
      router.push(`/dashboard/sessions-caisse/${created.data.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/sessions-caisse" className="hover:text-white/70">
          Sessions de caisse
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Créer</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Créer session de caisse</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Espèces d&apos;ouverture<span className="text-red-400">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="10000"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-white/40">Montant en FCFA (ex : 10000).</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Période comptable<span className="text-red-400">*</span>
              </label>
              <select
                required
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#12141c]">
                  Sélectionnez une option
                </option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#12141c]">
                    {p.name}
                  </option>
                ))}
              </select>
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
            {submitting ? "..." : "Créer"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/sessions-caisse")}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
