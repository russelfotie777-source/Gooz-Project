"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

export type CategoryFormValues = {
  name: string;
  slug: string;
  is_active: boolean;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({
  initial,
  existingImage,
  submitting,
  error,
  showAddAnother = false,
  submitLabel = "Créer",
  onCancel,
  onSubmit,
}: {
  initial?: Partial<CategoryFormValues>;
  existingImage?: string | null;
  submitting: boolean;
  error: string | null;
  showAddAnother?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (formData: FormData, addAnother: boolean) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(existingImage ?? null);
  const [dragOver, setDragOver] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function buildFormData(): FormData {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug || slugify(name));
    formData.set("is_active", isActive ? "1" : "0");
    if (image) formData.set("image", image);
    return formData;
  }

  function handleSubmit(e: React.FormEvent, addAnother: boolean) {
    e.preventDefault();
    onSubmit(buildFormData(), addAnother);
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Détails de la catégorie</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Nom<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Slug<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="ex: telephones-tablettes"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Image</label>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                dragOver ? "border-brand-orange bg-brand-orange/5" : "border-white/10 hover:border-white/20"
              }`}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Aperçu" className="h-20 w-20 rounded-lg object-cover ring-1 ring-white/10" />
              ) : (
                <UploadCloud className="h-6 w-6 text-white/30" />
              )}
              <p className="text-sm text-white/40">
                Faites glisser vos fichiers ou <span className="font-medium text-brand-blue">Parcourir</span>
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
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
