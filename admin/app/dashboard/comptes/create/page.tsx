"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

const TYPE_OPTIONS = [
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "revenue", label: "Revenue" },
  { value: "expense", label: "Expense" },
];

export default function CreateComptePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(andAddAnother: boolean) {
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch("/admin/accounts", {
        method: "POST",
        body: JSON.stringify({ code, name, type, is_active: isActive }),
      });

      if (andAddAnother) {
        setCode("");
        setName("");
        setType("");
        setIsActive(true);
      } else {
        router.push("/dashboard/comptes");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/comptes" className="hover:text-white/70">
          Comptes
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Créer</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Créer Compte</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
        className="flex flex-col gap-6"
      >
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Code<span className="text-red-400">*</span>
              </label>
              <input required value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
              <p className="mt-1.5 text-xs text-white/40">
                Code court et unique utilisé par le système. Exemples : CASH, BANK_TRANSFER, MTN_MOMO,
                DELIVERY_SERVICE_EXPENSE.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Nom<span className="text-red-400">*</span>
              </label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              <p className="mt-1.5 text-xs text-white/40">
                Nom lisible affiché dans les rapports et les formulaires de paiement. Exemple : Caisse
                principale ou Compte bancaire.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Type<span className="text-red-400">*</span>
              </label>
              <select required value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                <option value="" className="bg-[#12141c]">
                  Sélectionnez une option
                </option>
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#12141c]">
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-white/40">
                Asset : argent ou valeur que vous possédez (Cash, Banque, Mobile Money, Carte). Liability :
                argent que vous devez (dépôts clients, dettes fournisseurs). Equity : capital du
                propriétaire. Revenue : argent gagné (ventes, frais). Expense : coûts de l&apos;activité
                (remboursements, commissions, livraison, fournitures).
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={`relative mt-1 h-5 w-9 shrink-0 rounded-full transition ${
                  isActive ? "bg-brand-orange" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                    isActive ? "left-4" : "left-0.5"
                  }`}
                />
              </button>
              <div>
                <p className="text-sm text-white/70">Actif</p>
                <p className="mt-1 text-xs text-white/40">
                  Les comptes actifs peuvent être sélectionnés dans les formulaires de paiement et de
                  comptabilité. Désactivez les comptes que le personnel ne doit plus utiliser.
                </p>
              </div>
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
            disabled={submitting}
            onClick={() => submit(true)}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 disabled:opacity-50"
          >
            Créer & Ajouter un autre
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
