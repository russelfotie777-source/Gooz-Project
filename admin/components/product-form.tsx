"use client";

import { useState } from "react";

export type ProductOption = { id: number; name: string };

export type ProductFormValues = {
  name: string;
  category_id: string;
  brand_id: string;
  reference: string;
  is_active: boolean;
  description: string;
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-brand-orange" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

export function ProductForm({
  categories,
  brands,
  initial,
  submitting,
  error,
  showAddAnother = false,
  submitLabel = "Créer",
  onCancel,
  onSubmit,
}: {
  categories: ProductOption[];
  brands: ProductOption[];
  initial?: Partial<ProductFormValues>;
  submitting: boolean;
  error: string | null;
  showAddAnother?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (payload: Record<string, unknown>, addAnother: boolean) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [brandId, setBrandId] = useState(initial?.brand_id ?? "");
  const [reference, setReference] = useState(initial?.reference ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [description, setDescription] = useState(initial?.description ?? "");

  function buildPayload(): Record<string, unknown> {
    return {
      name,
      category_id: Number(categoryId),
      brand_id: brandId ? Number(brandId) : null,
      reference: reference || null,
      is_active: isActive,
      description: description || null,
    };
  }

  function handleSubmit(e: React.FormEvent, addAnother: boolean) {
    e.preventDefault();
    onSubmit(buildPayload(), addAnother);
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Détails du produit</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Titre<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Samsung TV"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Catégorie<span className="text-red-400">*</span>
            </label>
            <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="" className="bg-[#12141c]">
                Sélectionnez une option
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#12141c]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Marque</label>
            <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={inputClass}>
              <option value="" className="bg-[#12141c]">
                Aucune
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#12141c]">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Référence</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="ex: SKU-00123"
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Actif</span>
            <Toggle checked={isActive} onChange={setIsActive} />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-white/70">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={inputClass}
            />
          </div>
        </div>

        <p className="mt-5 rounded-lg bg-brand-blue/10 px-3 py-2.5 text-xs text-brand-blue">
          Le prix se définit au niveau des variantes, une fois le produit créé.
        </p>
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
