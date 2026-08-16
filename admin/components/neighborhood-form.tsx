"use client";

import { useState } from "react";

export type CityOption = { id: number; name: string };

export type NeighborhoodFormValues = {
  city_id: string;
  name: string;
  latitude: string;
  longitude: string;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

export function NeighborhoodForm({
  cities,
  initial,
  submitting,
  error,
  showAddAnother = false,
  submitLabel = "Créer",
  onCancel,
  onSubmit,
}: {
  cities: CityOption[];
  initial?: Partial<NeighborhoodFormValues>;
  submitting: boolean;
  error: string | null;
  showAddAnother?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>, addAnother: boolean) => void;
}) {
  const [cityId, setCityId] = useState(initial?.city_id ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [latitude, setLatitude] = useState(initial?.latitude ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude ?? "");

  function buildValues(): Record<string, unknown> {
    return {
      city_id: Number(cityId),
      name,
      latitude: Number(latitude),
      longitude: Number(longitude),
    };
  }

  function handleSubmit(e: React.FormEvent, addAnother: boolean) {
    e.preventDefault();
    onSubmit(buildValues(), addAnother);
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Informations du quartier</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Ville<span className="text-red-400">*</span>
            </label>
            <select required value={cityId} onChange={(e) => setCityId(e.target.value)} className={inputClass}>
              <option value="" className="bg-[#12141c]">
                Sélectionnez une option
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#12141c]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Nom du quartier<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Bonapriso"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Latitude<span className="text-red-400">*</span>
            </label>
            <input
              required
              type="number"
              step="0.0000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="ex: 4.0483"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Longitude<span className="text-red-400">*</span>
            </label>
            <input
              required
              type="number"
              step="0.0000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="ex: 9.6987"
              className={inputClass}
            />
          </div>
        </div>
        <p className="mt-4 text-xs text-white/30">
          Les coordonnées servent de point de départ pour estimer les frais de livraison avant qu&apos;un
          client n&apos;ait renseigné son adresse exacte.
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
