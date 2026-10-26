"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export type ProductOption = { id: number; name: string };

export type ProductSpecificationValue = { label: string; value: string };

export type ProductFormValues = {
  name: string;
  category_ids: string[];
  brand_id: string;
  reference: string;
  is_active: boolean;
  description: string;
  meta_description: string;
  specifications: ProductSpecificationValue[];
  product_details: string;
  more_info: string;
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
  const [categoryIds, setCategoryIds] = useState<string[]>(initial?.category_ids ?? []);
  const [brandId, setBrandId] = useState(initial?.brand_id ?? "");
  const [reference, setReference] = useState(initial?.reference ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [specifications, setSpecifications] = useState<ProductSpecificationValue[]>(
    initial?.specifications ?? []
  );
  const [productDetails, setProductDetails] = useState(initial?.product_details ?? "");
  const [moreInfo, setMoreInfo] = useState(initial?.more_info ?? "");

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  function addSpecificationRow() {
    setSpecifications((prev) => [...prev, { label: "", value: "" }]);
  }

  function updateSpecificationRow(index: number, field: "label" | "value", fieldValue: string) {
    setSpecifications((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: fieldValue } : row)));
  }

  function removeSpecificationRow(index: number) {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  }

  function buildPayload(): Record<string, unknown> {
    return {
      name,
      category_ids: categoryIds.map(Number),
      brand_id: brandId ? Number(brandId) : null,
      reference: reference || null,
      is_active: isActive,
      description: description || null,
      meta_description: metaDescription || null,
      // Rows left half-filled by the admin (e.g. a label typed with no
      // value yet) are dropped rather than sent — the backend requires
      // both when a row is present at all (specifications.*.value is
      // required_with:specifications), so this avoids a confusing 422 for
      // what's really just a draft row still being filled in.
      specifications: specifications.filter((row) => row.label.trim() && row.value.trim()),
      product_details: productDetails || null,
      more_info: moreInfo || null,
    };
  }

  function handleSubmit(e: React.FormEvent, addAnother: boolean) {
    e.preventDefault();
    if (categoryIds.length === 0) return;
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
              Catégories<span className="text-red-400">*</span>
            </label>
            <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-2.5">
              {categories.length === 0 && <p className="px-1 py-1 text-sm text-white/30">Aucune catégorie.</p>}
              {categories.map((c) => {
                const id = String(c.id);
                const checked = categoryIds.includes(id);
                return (
                  <label key={c.id} className="flex items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(id)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5"
                    />
                    <span className="text-white/80">{c.name}</span>
                  </label>
                );
              })}
            </div>
            {categoryIds.length === 0 && (
              <p className="mt-1 text-xs text-red-400">Sélectionnez au moins une catégorie.</p>
            )}
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

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-white/70">Méta-description SEO</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value.slice(0, 300))}
              rows={2}
              maxLength={300}
              placeholder="Résumé court affiché dans les résultats Google. Vide = la description ci-dessus est réutilisée."
              className={inputClass}
            />
            <p className={`mt-1 text-xs ${metaDescription.length > 160 ? "text-brand-orange" : "text-white/30"}`}>
              {metaDescription.length}/160 caractères recommandés (300 max)
            </p>
          </div>
        </div>

        <p className="mt-5 rounded-lg bg-brand-blue/10 px-3 py-2.5 text-xs text-brand-blue">
          Le prix se définit au niveau des variantes, une fois le produit créé.
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-1 text-sm font-semibold text-white/70">Fiche produit (page client)</h2>
        <p className="mb-5 text-xs text-white/40">
          Contrôle directement ce qui s&apos;affiche dans les sections &quot;Spécifications&quot;, &quot;Détails du
          produit&quot; et &quot;Plus d&apos;information&quot; de la fiche produit. Laissé vide, chaque section
          retombe sur un contenu généré automatiquement à partir des autres champs du produit.
        </p>

        <div className="mb-5">
          <label className="mb-1.5 block text-sm text-white/70">Spécifications</label>
          <div className="flex flex-col gap-2">
            {specifications.length === 0 && (
              <p className="text-sm text-white/30">Aucune spécification — la section sera générée automatiquement.</p>
            )}
            {specifications.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={row.label}
                  onChange={(e) => updateSpecificationRow(index, "label", e.target.value)}
                  placeholder="Poids"
                  className={`${inputClass} w-2/5`}
                />
                <input
                  value={row.value}
                  onChange={(e) => updateSpecificationRow(index, "value", e.target.value)}
                  placeholder="350 g"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeSpecificationRow(index)}
                  className="rounded p-2 text-red-400 hover:bg-white/10"
                  aria-label="Supprimer cette ligne"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSpecificationRow}
            className="mt-2 flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter une spécification
          </button>
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-sm text-white/70">Détails du produit</label>
          <textarea
            value={productDetails}
            onChange={(e) => setProductDetails(e.target.value)}
            rows={4}
            placeholder="Un paragraphe par ligne."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-white/70">Plus d&apos;information</label>
          <textarea
            value={moreInfo}
            onChange={(e) => setMoreInfo(e.target.value)}
            rows={4}
            placeholder="Garantie, retours, service après-vente propres à ce produit..."
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting || categoryIds.length === 0}
          className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
        >
          {submitting ? "..." : submitLabel}
        </button>
        {showAddAnother && (
          <button
            type="button"
            disabled={submitting || categoryIds.length === 0}
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
