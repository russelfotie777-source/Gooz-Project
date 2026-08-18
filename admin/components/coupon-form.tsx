"use client";

import { useState } from "react";

export type CouponFormValues = {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  min_order_amount: string;
  max_uses: string;
  expires_at: string;
  is_active: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

export function CouponForm({
  initial,
  usedCount,
  submitting,
  error,
  showAddAnother = false,
  submitLabel = "Créer",
  onCancel,
  onSubmit,
}: {
  initial?: Partial<CouponFormValues>;
  usedCount?: number;
  submitting: boolean;
  error: string | null;
  showAddAnother?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>, addAnother: boolean) => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [type, setType] = useState<"percentage" | "fixed">(initial?.type ?? "percentage");
  const [value, setValue] = useState(initial?.value ?? "");
  const [minOrderAmount, setMinOrderAmount] = useState(initial?.min_order_amount ?? "");
  const [maxUses, setMaxUses] = useState(initial?.max_uses ?? "");
  const [expiresAt, setExpiresAt] = useState(initial?.expires_at ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const isEdit = initial !== undefined;

  function buildValues(): Record<string, unknown> {
    return {
      ...(isEdit ? {} : { code: code || null }),
      type,
      value: Number(value),
      min_order_amount: minOrderAmount ? Number(minOrderAmount) : null,
      max_uses: maxUses ? Number(maxUses) : null,
      expires_at: expiresAt || null,
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
        <h2 className="mb-5 text-sm font-semibold text-white/70">Coupon</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {isEdit ? (
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Code</label>
              <input disabled value={code} className={`${inputClass} cursor-not-allowed opacity-60`} />
              <p className="mt-1 text-xs text-white/30">Le code d&apos;un coupon ne peut pas être modifié.</p>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Généré automatiquement"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-white/30">
                Le code sera généré automatiquement si laissé vide (ex. PROMOABC123).
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Type<span className="text-red-400">*</span>
            </label>
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
              className={inputClass}
            >
              <option value="percentage" className="bg-[#12141c]">
                Pourcentage
              </option>
              <option value="fixed" className="bg-[#12141c]">
                Montant fixe
              </option>
            </select>
            <p className="mt-1 text-xs text-white/30">
              Choisir pourcentage pour une réduction en % ou montant fixe pour une réduction forfaitaire.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Valeur<span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                max={type === "percentage" ? 100 : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={inputClass}
              />
              <span className="shrink-0 text-xs font-medium text-white/40">
                {type === "percentage" ? "%" : "XAF"}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Total minimum</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className={inputClass}
              />
              <span className="shrink-0 text-xs font-medium text-white/40">XAF</span>
            </div>
            <p className="mt-1 text-xs text-white/30">
              Optionnel. Le client doit dépenser au moins ce montant pour que le coupon s&apos;applique.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Limite totale</label>
            <input
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Illimité"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/30">Nombre maximum d&apos;utilisations totales.</p>
          </div>

          {isEdit && (
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Total utilisé</label>
              <input disabled value={usedCount ?? 0} className={`${inputClass} cursor-not-allowed opacity-60`} />
              <p className="mt-1 text-xs text-white/30">Suivi automatique, non modifiable.</p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Se termine le</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
            <p className="mt-1 text-xs text-white/30">Laisser vide pour aucune expiration.</p>
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
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 disabled:opacity-50"
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
