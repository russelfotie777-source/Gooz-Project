"use client";

import { useState } from "react";

export type AnnouncementFormValues = {
  text: string;
  icon: string;
  link_url: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

const TEXT_RECOMMENDED_MAX = 70;
const TEXT_HARD_MAX = 150;

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Same reasoning as BannerForm's equivalent helper: a datetime-local input
// gives a timezone-less wall-clock string, and the backend runs in UTC.
function toIsoFromLocalInput(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export function AnnouncementForm({
  initial,
  submitting,
  error,
  showAddAnother = false,
  submitLabel = "Créer",
  onCancel,
  onSubmit,
}: {
  initial?: Partial<AnnouncementFormValues>;
  submitting: boolean;
  error: string | null;
  showAddAnother?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (payload: Record<string, unknown>, addAnother: boolean) => void;
}) {
  const [text, setText] = useState(initial?.text ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [linkUrl, setLinkUrl] = useState(initial?.link_url ?? "");
  const [startsAt, setStartsAt] = useState(initial?.starts_at ? toLocalInput(initial.starts_at) : "");
  const [endsAt, setEndsAt] = useState(initial?.ends_at ? toLocalInput(initial.ends_at) : "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  function buildPayload(): Record<string, unknown> {
    return {
      text,
      icon: icon || null,
      link_url: linkUrl || null,
      starts_at: startsAt ? toIsoFromLocalInput(startsAt) : null,
      ends_at: endsAt ? toIsoFromLocalInput(endsAt) : null,
      is_active: isActive,
    };
  }

  function handleSubmit(e: React.FormEvent, addAnother: boolean) {
    e.preventDefault();
    onSubmit(buildPayload(), addAnother);
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Détails de l&apos;annonce</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-white/70">
              Texte<span className="text-red-400">*</span>
            </label>
            <input
              required
              maxLength={TEXT_HARD_MAX}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Livraison gratuite partout dès 50 000 XAF"
              className={inputClass}
            />
            <p className={`mt-1 text-xs ${text.length > TEXT_RECOMMENDED_MAX ? "text-amber-400" : "text-white/30"}`}>
              {text.length}/{TEXT_HARD_MAX} caractères — visez plutôt {TEXT_RECOMMENDED_MAX} pour que le message
              tienne sur une ligne, y compris sur mobile.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Icône</label>
            <input
              maxLength={16}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🚚"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/30">
              Un emoji collé tel quel, affiché avant le texte. Facultatif.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Lien</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/30">
              Si renseigné, toute la barre devient cliquable et redirige vers ce lien.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Débute le</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
            <p className="mt-1 text-xs text-white/30">Laissez vide pour un affichage immédiat.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Se termine le</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
            <p className="mt-1 text-xs text-white/30">Laissez vide pour un affichage sans date de fin.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Actif</label>
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
            <p className="mt-1 text-xs text-white/30">Activez cette option pour permettre l&apos;affichage de l&apos;annonce.</p>
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
