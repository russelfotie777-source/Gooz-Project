"use client";

import { useState } from "react";

export type WarehouseFormValues = {
  name: string;
  type: string;
  code: string;
  region: string;
  pays: string;
  ville: string;
  quartier: string;
  latitude: string;
  longitude: string;
  phone: string;
  responsible_name: string;
  is_active: boolean;
};

const TYPES = [
  { value: "entrepot", label: "Entrepôt" },
  { value: "boutique", label: "Boutique" },
];

export function WarehouseForm({
  initial,
  submitting,
  error,
  showAddAnother = false,
  submitLabel = "Créer",
  onCancel,
  onSubmit,
}: {
  initial?: Partial<WarehouseFormValues>;
  submitting: boolean;
  error: string | null;
  showAddAnother?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>, addAnother: boolean) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "entrepot");
  const [code, setCode] = useState(initial?.code ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [pays, setPays] = useState(initial?.pays ?? "Cameroun");
  const [ville, setVille] = useState(initial?.ville ?? "");
  const [quartier, setQuartier] = useState(initial?.quartier ?? "");
  const [latitude, setLatitude] = useState(initial?.latitude ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [responsibleName, setResponsibleName] = useState(initial?.responsible_name ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  function buildValues(): Record<string, unknown> {
    return {
      name,
      type,
      code: code || null,
      region,
      pays,
      ville,
      quartier: quartier || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
      phone: phone || null,
      responsible_name: responsibleName || null,
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
        <h2 className="mb-5 text-sm font-semibold text-white/70">Détails de l&apos;emplacement</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Nom<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Type<span className="text-red-400">*</span>
            </label>
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

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex: DLA-WH1"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
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
            <label className="mb-1.5 block text-sm text-white/70">
              Région<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Ville<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Quartier</label>
            <input
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Latitude<span className="text-red-400">*</span>
            </label>
            <input
              required
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Longitude<span className="text-red-400">*</span>
            </label>
            <input
              required
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Responsable</label>
            <input
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
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
