"use client";

import { useState } from "react";

export type ProductOption = { id: number; name: string };

export type VariantFormValues = {
  product_id: string;
  name: string;
  size: string;
  color: string;
  material: string;
  barcode: string;
  base_price: string;
  promo_price: string;
  is_promotion: boolean;
  cost_price: string;
  tax_rate: string;
  is_active: boolean;
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

export function VariantForm({
  products,
  initial,
  submitting,
  error,
  submitLabel = "Créer",
  onCancel,
  onSubmit,
}: {
  products: ProductOption[];
  initial?: Partial<VariantFormValues>;
  submitting: boolean;
  error: string | null;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [productId, setProductId] = useState(initial?.product_id ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [size, setSize] = useState(initial?.size ?? "");
  const [color, setColor] = useState(initial?.color ?? "");
  const [material, setMaterial] = useState(initial?.material ?? "");
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");
  const [basePrice, setBasePrice] = useState(initial?.base_price ?? "");
  const [isPromotion, setIsPromotion] = useState(initial?.is_promotion ?? false);
  const [promoPrice, setPromoPrice] = useState(initial?.promo_price ?? "");
  const [costPrice, setCostPrice] = useState(initial?.cost_price ?? "");
  const [taxRate, setTaxRate] = useState(initial?.tax_rate ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      product_id: Number(productId),
      name: name || null,
      size: size || null,
      color: color || null,
      material: material || null,
      barcode: barcode || null,
      base_price: Number(basePrice),
      is_promotion: isPromotion,
      promo_price: isPromotion && promoPrice ? Number(promoPrice) : null,
      cost_price: costPrice ? Number(costPrice) : null,
      tax_rate: taxRate ? Number(taxRate) : null,
      is_active: isActive,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Détails de la variante</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Produit<span className="text-red-400">*</span>
            </label>
            <select required value={productId} onChange={(e) => setProductId(e.target.value)} className={inputClass}>
              <option value="" className="bg-[#12141c]">
                Sélectionnez une option
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#12141c]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Titre de la variante</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Taille 42 - Bleu"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Taille</label>
            <input value={size} onChange={(e) => setSize(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Couleur</label>
            <input value={color} onChange={(e) => setColor(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Matière</label>
            <input value={material} onChange={(e) => setMaterial(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">SKU / Code-barres</label>
            <input value={barcode} onChange={(e) => setBarcode(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Prix de base (XAF)<span className="text-red-400">*</span>
            </label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Actif</span>
            <Toggle checked={isActive} onChange={setIsActive} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">En promotion</span>
            <Toggle checked={isPromotion} onChange={setIsPromotion} />
          </div>

          {isPromotion && (
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Prix promo (XAF)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-white/5 pt-5">
          <p className="mb-4 text-xs text-white/40">
            Comptabilité (optionnel) — utilisé par le futur module de comptabilité.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Prix de revient (XAF)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="Optionnel"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">TVA applicable (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="Optionnel, ex: 19.25"
                className={inputClass}
              />
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
          {submitting ? "..." : submitLabel}
        </button>
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
