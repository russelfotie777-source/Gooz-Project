"use client";

import { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import { apiFetch } from "@/lib/api";

export type ProductOption = { id: number; name: string };

export type BannerFormValues = {
  title: string;
  description: string;
  link_type: "external" | "product";
  link_url: string;
  product_id: number | null;
  product_name: string;
  location: "homepage" | "homepage_ad_1" | "homepage_ad_2" | "category" | "search" | "checkout";
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// datetime-local inputs give back a timezone-less wall-clock string (e.g.
// "2026-08-20T15:00") — new Date() parses that as the BROWSER's local time,
// so .toISOString() converts it to real UTC before it's sent. Without this,
// the backend (which runs in UTC) stored the admin's local clock reading as
// if it already were UTC — an admin anywhere ahead of UTC would create a
// banner that silently doesn't appear until real UTC time catches up to
// what they typed.
function toIsoFromLocalInput(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export function BannerForm({
  initial,
  existingImage,
  submitting,
  error,
  showAddAnother = false,
  submitLabel = "Créer",
  onCancel,
  onSubmit,
}: {
  initial?: Partial<BannerFormValues>;
  existingImage?: string | null;
  submitting: boolean;
  error: string | null;
  showAddAnother?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (formData: FormData, addAnother: boolean) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [linkType, setLinkType] = useState<BannerFormValues["link_type"]>(initial?.link_type ?? "external");
  const [linkUrl, setLinkUrl] = useState(initial?.link_url ?? "");
  const [productId, setProductId] = useState<number | null>(initial?.product_id ?? null);
  const [productName, setProductName] = useState(initial?.product_name ?? "");
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductOption[]>([]);
  const [location, setLocation] = useState<BannerFormValues["location"]>(initial?.location ?? "homepage");
  // starts_at/ends_at are required (the backend needs a real window), but
  // leaving them blank by default meant a new banner was invisible until
  // the admin thought to fill both in — default to "active right now,
  // for a year" so a fresh banner just works, still fully editable.
  const [startsAt, setStartsAt] = useState(() =>
    initial?.starts_at ? toLocalInput(initial.starts_at) : toLocalInput(new Date().toISOString())
  );
  const [endsAt, setEndsAt] = useState(() =>
    initial?.ends_at
      ? toLocalInput(initial.ends_at)
      : toLocalInput(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString())
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(existingImage ?? null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!productSearch) return;
    const timeout = setTimeout(() => {
      apiFetch<{ data: ProductOption[] }>(`/admin/products?q=${encodeURIComponent(productSearch)}&per_page=8`)
        .then((res) => setProductResults(res.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [productSearch]);

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function buildFormData(): FormData {
    const formData = new FormData();
    formData.set("title", title);
    if (description) formData.set("description", description);
    formData.set("link_type", linkType);
    if (linkType === "external") {
      formData.set("link_url", linkUrl);
    } else if (productId) {
      formData.set("product_id", String(productId));
    }
    formData.set("location", location);
    if (startsAt) formData.set("starts_at", toIsoFromLocalInput(startsAt));
    if (endsAt) formData.set("ends_at", toIsoFromLocalInput(endsAt));
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
        <h2 className="mb-5 text-sm font-semibold text-white/70">Détails de la bannière</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Titre<span className="text-red-400">*</span>
            </label>
            <input
              required
              minLength={3}
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/30">Saisissez un titre clair entre 3 et 100 caractères.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Image de bannière{!existingImage && <span className="text-red-400">*</span>}
            </label>
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
              className={`flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-4 text-center transition-colors ${
                dragOver ? "border-brand-orange bg-brand-orange/5" : "border-white/10 hover:border-white/20"
              }`}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Aperçu" className="h-14 w-28 rounded-lg object-cover ring-1 ring-white/10" />
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
            <p className="mt-1 text-xs text-white/30">Téléversez une image de bannière de 2 Mo maximum.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Type de bannière<span className="text-red-400">*</span>
            </label>
            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as BannerFormValues["link_type"])}
              className={inputClass}
            >
              <option value="external" className="bg-[#12141c]">Site web externe</option>
              <option value="product" className="bg-[#12141c]">Produit interne</option>
            </select>
            <p className="mt-1 text-xs text-white/30">
              Choisissez si la bannière ouvre un produit interne ou un site web externe.
            </p>
          </div>

          {linkType === "external" ? (
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                URL du lien<span className="text-red-400">*</span>
              </label>
              <input
                required
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-white/30">
                Saisissez une URL externe complète commençant par http:// ou https://.
              </p>
            </div>
          ) : (
            <div className="relative">
              <label className="mb-1.5 block text-sm text-white/70">
                Produit<span className="text-red-400">*</span>
              </label>
              <input
                required={!productId}
                value={productId ? productName : productSearch}
                onChange={(e) => {
                  setProductId(null);
                  setProductSearch(e.target.value);
                }}
                placeholder="Rechercher un produit..."
                className={inputClass}
              />
              {!productId && productSearch && productResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                  {productResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProductId(p.id);
                        setProductName(p.name);
                        setProductSearch("");
                        setProductResults([]);
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-white/70">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Description optionnelle"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/30">Saisissez une description facultative pour cette bannière.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Emplacement<span className="text-red-400">*</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as BannerFormValues["location"])}
              className={inputClass}
            >
              <option value="homepage" className="bg-[#12141c]">Page d&apos;accueil — carrousel principal</option>
              <option value="homepage_ad_1" className="bg-[#12141c]">Page d&apos;accueil — bannière latérale 1</option>
              <option value="homepage_ad_2" className="bg-[#12141c]">Page d&apos;accueil — bannière latérale 2</option>
              <option value="category" className="bg-[#12141c]">Page catégorie</option>
              <option value="search" className="bg-[#12141c]">Résultats de recherche</option>
              <option value="checkout" className="bg-[#12141c]">Paiement</option>
            </select>
            <p className="mt-1 text-xs text-white/30">Choisissez où cette bannière sera affichée.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Débute le<span className="text-red-400">*</span>
            </label>
            <input
              required
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
            <p className="mt-1 text-xs text-white/30">Choisissez la date à laquelle la bannière devient visible.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Se termine le<span className="text-red-400">*</span>
            </label>
            <input
              required
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
            <p className="mt-1 text-xs text-white/30">Choisissez la date à laquelle la bannière cesse d&apos;être visible.</p>
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
            <p className="mt-1 text-xs text-white/30">Activez cette option pour permettre l&apos;affichage de la bannière.</p>
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
