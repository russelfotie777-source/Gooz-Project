"use client";

import { useState } from "react";

export type SupplierFormValues = {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  pays: string;
  numero_fiscal: string;
  adresse: string;
  notes: string;
  type: string;
  is_active: boolean;
};

const TYPES = [
  { value: "local", label: "Local" },
  { value: "international", label: "International" },
];

export function SupplierForm({
  initial,
  submitting,
  error,
  showAddAnother = false,
  submitLabel = "Créer",
  onCancel,
  onSubmit,
}: {
  initial?: Partial<SupplierFormValues>;
  submitting: boolean;
  error: string | null;
  showAddAnother?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>, addAnother: boolean) => void;
}) {
  const [companyName, setCompanyName] = useState(initial?.company_name ?? "");
  const [contactName, setContactName] = useState(initial?.contact_name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [pays, setPays] = useState(initial?.pays ?? "Cameroun");
  const [numeroFiscal, setNumeroFiscal] = useState(initial?.numero_fiscal ?? "");
  const [adresse, setAdresse] = useState(initial?.adresse ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [type, setType] = useState(initial?.type ?? "local");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  function buildValues(): Record<string, unknown> {
    return {
      company_name: companyName,
      contact_name: contactName,
      email: email || null,
      phone,
      pays,
      numero_fiscal: numeroFiscal || null,
      adresse,
      notes: notes || null,
      type,
      is_active: isActive,
    };
  }

  function handleSubmit(e: React.FormEvent, addAnother: boolean) {
    e.preventDefault();
    onSubmit(buildValues(), addAnother);
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Informations fournisseur</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Nom<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
            <p className="mt-1 text-xs text-white/30">Nom principal du fournisseur utilisé dans les achats.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Personne de contact<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
            <p className="mt-1 text-xs text-white/30">Contact principal pour ce fournisseur.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
            <p className="mt-1 text-xs text-white/30">E-mail du fournisseur pour les communications d&apos;achat.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Téléphone<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Pays</label>
            <input
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Numéro fiscal</label>
            <input
              value={numeroFiscal}
              onChange={(e) => setNumeroFiscal(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
            <p className="mt-1 text-xs text-white/30">Numéro fiscal ou d&apos;immatriculation optionnel.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-[#12141c]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-between">
            <span className="text-sm text-white/70">Actif</span>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isActive ? "bg-brand-orange" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-white/70">
              Adresse<span className="text-red-400">*</span>
            </label>
            <textarea
              required
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
            <p className="mt-1 text-xs text-white/30">Adresse de facturation ou opérationnelle du fournisseur.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-white/70">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
            <p className="mt-1 text-xs text-white/30">Notes internes visibles uniquement en back-office.</p>
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
          {submitting ? "..." : submitLabel}
        </button>
        {showAddAnother && (
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, true)}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 disabled:opacity-50"
          >
            Créer & Ajouter un autre
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
