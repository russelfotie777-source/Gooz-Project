"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, XCircle } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Expense = {
  id: number;
  code: string;
  payee: string;
  expense_account: { id: number; name: string } | null;
  paid_from_account: { id: number; name: string } | null;
  amount: string;
  currency: string;
  date: string;
  status: "enregistrée" | "annulée";
  notes: string | null;
  creator: { id: number; name: string } | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  enregistrée: "Enregistrée",
  annulée: "Annulée",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "long" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <h2 className="mb-5 text-sm font-semibold text-white/70">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <div className="mt-1 text-sm text-white">{children}</div>
    </div>
  );
}

export default function ExpenseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const expenseId = Number(params.id);

  const [expense, setExpense] = useState<Expense | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch<{ data: Expense }>(`/admin/expenses/${expenseId}`)
      .then((res) => setExpense(res.data))
      .catch(() => setError("Impossible de charger cette dépense."));
  }

  useEffect(load, [expenseId]);

  async function cancelExpense() {
    if (!expense) return;
    if (!confirm("Annuler cette dépense ?")) return;
    setBusy(true);
    try {
      await apiFetch(`/admin/expenses/${expense.id}/cancel`, { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'annulation.");
    } finally {
      setBusy(false);
    }
  }

  if (!expense) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-sm text-red-400">{error}</p> : <p className="text-sm text-white/40">Chargement…</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/expenses" className="hover:text-white/70">
          Expenses
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{expense.code}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{expense.code}</h1>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            expense.status === "enregistrée" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {STATUS_LABELS[expense.status] ?? expense.status}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Section title="Aperçu">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Payee">{expense.payee}</Field>
          <Field label="Date">{formatDate(expense.date)}</Field>
          <Field label="Amount">{Number(expense.amount).toLocaleString("fr-FR")} {expense.currency}</Field>
          <Field label="Expense Account">{expense.expense_account?.name ?? "—"}</Field>
          <Field label="Paid From">{expense.paid_from_account?.name ?? "—"}</Field>
          <Field label="Créé par">{expense.creator?.name ?? "—"}</Field>
          {expense.notes && (
            <div className="sm:col-span-3">
              <p className="text-xs text-white/40">Notes</p>
              <p className="mt-1 text-sm text-white">{expense.notes}</p>
            </div>
          )}
        </div>
      </Section>

      <div className="flex flex-wrap gap-3">
        {expense.status === "enregistrée" && (
          <button
            onClick={cancelExpense}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Annuler la dépense
          </button>
        )}
        <button
          onClick={() => router.push("/dashboard/expenses")}
          className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  );
}
