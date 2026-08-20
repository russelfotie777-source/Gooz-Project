"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type AccountOption = { id: number; code: string; name: string; type: string };

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CreateExpensePage() {
  const router = useRouter();
  const [expenseAccounts, setExpenseAccounts] = useState<AccountOption[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<AccountOption[]>([]);

  const [payee, setPayee] = useState("");
  const [expenseAccountId, setExpenseAccountId] = useState("");
  const [paidFromAccountId, setPaidFromAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Paginated<AccountOption>>("/admin/accounts?type=expense&per_page=100")
      .then((res) => setExpenseAccounts(res.data))
      .catch(() => {});
    apiFetch<Paginated<AccountOption>>("/admin/accounts?type=asset&per_page=100")
      .then((res) => setAssetAccounts(res.data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const created = await apiFetch<{ data: { id: number } }>("/admin/expenses", {
        method: "POST",
        body: JSON.stringify({
          payee,
          expense_account_id: Number(expenseAccountId),
          paid_from_account_id: Number(paidFromAccountId),
          amount: Number(amount),
          date,
          notes: notes || null,
        }),
      });
      router.push(`/dashboard/expenses/${created.data.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/expenses" className="hover:text-white/70">
          Expenses
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Créer</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Créer Expense</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Payee<span className="text-red-400">*</span>
              </label>
              <input required value={payee} onChange={(e) => setPayee(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Date<span className="text-red-400">*</span>
              </label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Expense Account<span className="text-red-400">*</span>
              </label>
              <select
                required
                value={expenseAccountId}
                onChange={(e) => setExpenseAccountId(e.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#12141c]">
                  Sélectionnez une option
                </option>
                {expenseAccounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-[#12141c]">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Paid From<span className="text-red-400">*</span>
              </label>
              <select
                required
                value={paidFromAccountId}
                onChange={(e) => setPaidFromAccountId(e.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#12141c]">
                  Sélectionnez une option
                </option>
                {assetAccounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-[#12141c]">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Amount<span className="text-red-400">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
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
            onClick={() => router.push("/dashboard/expenses")}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
