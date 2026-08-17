"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

export type CategoryOption = { id: number; name: string };
export type BrandOption = { id: number; name: string };
export type ProductOption = { id: number; name: string; reference: string | null };

export type HomepageSectionItemValue = { product_id: number; name: string };

export type HomepageSectionFormValues = {
  internal_name: string;
  display_title: string;
  slug: string;
  description: string;
  section_type: "automatic" | "manual" | "mixed";
  display_layout: "horizontal_list" | "grid";
  automatic_strategy: string;
  display_mode: "variants" | "products";
  sort_direction: "asc" | "desc";
  item_limit: string;
  visibility: "everyone" | "logged_in" | "guests";
  view_all_url: string;
  starts_at: string;
  ends_at: string;
  show_title: boolean;
  show_view_all: boolean;
  is_active: boolean;
  window_days: string;
  category_ids: number[];
  brand_ids: number[];
  min_price: string;
  max_price: string;
  in_stock_only: boolean;
  campaign_products_only: boolean;
  items: HomepageSectionItemValue[];
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

export function HomepageSectionForm({
  initial,
  submitting,
  error,
  showAddAnother = false,
  submitLabel = "Créer",
  onCancel,
  onSubmit,
}: {
  initial?: Partial<HomepageSectionFormValues>;
  submitting: boolean;
  error: string | null;
  showAddAnother?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>, addAnother: boolean) => void;
}) {
  const isEdit = initial !== undefined;

  const [internalName, setInternalName] = useState(initial?.internal_name ?? "");
  const [displayTitle, setDisplayTitle] = useState(initial?.display_title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const [sectionType, setSectionType] = useState<HomepageSectionFormValues["section_type"]>(
    initial?.section_type ?? "automatic"
  );
  const [displayLayout, setDisplayLayout] = useState<HomepageSectionFormValues["display_layout"]>(
    initial?.display_layout ?? "horizontal_list"
  );
  const [automaticStrategy, setAutomaticStrategy] = useState(initial?.automatic_strategy ?? "new_arrivals");
  const [displayMode, setDisplayMode] = useState<HomepageSectionFormValues["display_mode"]>(
    initial?.display_mode ?? "products"
  );
  const [sortDirection, setSortDirection] = useState<HomepageSectionFormValues["sort_direction"]>(
    initial?.sort_direction ?? "asc"
  );
  const [itemLimit, setItemLimit] = useState(initial?.item_limit ?? "8");
  const [visibility, setVisibility] = useState<HomepageSectionFormValues["visibility"]>(
    initial?.visibility ?? "everyone"
  );
  const [viewAllUrl, setViewAllUrl] = useState(initial?.view_all_url ?? "");
  const [startsAt, setStartsAt] = useState(initial?.starts_at ? toLocalInput(initial.starts_at) : "");
  const [endsAt, setEndsAt] = useState(initial?.ends_at ? toLocalInput(initial.ends_at) : "");
  const [showTitle, setShowTitle] = useState(initial?.show_title ?? true);
  const [showViewAll, setShowViewAll] = useState(initial?.show_view_all ?? true);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const [windowDays, setWindowDays] = useState(initial?.window_days ?? "30");
  const [categoryIds, setCategoryIds] = useState<number[]>(initial?.category_ids ?? []);
  const [brandIds, setBrandIds] = useState<number[]>(initial?.brand_ids ?? []);
  const [minPrice, setMinPrice] = useState(initial?.min_price ?? "");
  const [maxPrice, setMaxPrice] = useState(initial?.max_price ?? "");
  const [inStockOnly, setInStockOnly] = useState(initial?.in_stock_only ?? false);
  const [campaignProductsOnly, setCampaignProductsOnly] = useState(initial?.campaign_products_only ?? false);

  const [items, setItems] = useState<HomepageSectionItemValue[]>(initial?.items ?? []);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductOption[]>([]);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);

  useEffect(() => {
    apiFetch<{ data: CategoryOption[] }>("/admin/categories?per_page=100")
      .then((res) => setCategories(res.data))
      .catch(() => {});
    apiFetch<{ data: BrandOption[] }>("/admin/brands?per_page=100")
      .then((res) => setBrands(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!productSearch) return;
    const timeout = setTimeout(() => {
      apiFetch<{ data: ProductOption[] }>(`/admin/products?q=${encodeURIComponent(productSearch)}&per_page=8`)
        .then((res) => setProductResults(res.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [productSearch]);

  const isAutomatic = sectionType === "automatic" || sectionType === "mixed";
  const isManual = sectionType === "manual" || sectionType === "mixed";

  function toggleCategory(id: number) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  function toggleBrand(id: number) {
    setBrandIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }

  function addItem(product: ProductOption) {
    if (items.some((i) => i.product_id === product.id)) return;
    setItems((prev) => [...prev, { product_id: product.id, name: product.name }]);
  }

  function removeItem(productId: number) {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function buildValues(): Record<string, unknown> {
    const values: Record<string, unknown> = {
      internal_name: internalName,
      display_title: displayTitle,
      description: description || null,
      section_type: sectionType,
      display_layout: displayLayout,
      automatic_strategy: isAutomatic ? automaticStrategy : null,
      display_mode: displayMode,
      sort_direction: sortDirection,
      item_limit: Number(itemLimit),
      visibility,
      view_all_url: viewAllUrl || null,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      show_title: showTitle,
      show_view_all: showViewAll,
      is_active: isActive,
      window_days: windowDays ? Number(windowDays) : null,
      category_ids: isAutomatic && categoryIds.length ? categoryIds : null,
      brand_ids: isAutomatic && brandIds.length ? brandIds : null,
      min_price: isAutomatic && minPrice ? Number(minPrice) : null,
      max_price: isAutomatic && maxPrice ? Number(maxPrice) : null,
      in_stock_only: inStockOnly,
      campaign_products_only: campaignProductsOnly,
    };

    if (!isEdit) {
      values.slug = slug || null;
    }

    if (isManual) {
      values.items = items.map((i) => ({ product_id: i.product_id }));
    }

    return values;
  }

  function handleSubmit(e: React.FormEvent, addAnother: boolean) {
    e.preventDefault();
    onSubmit(buildValues(), addAnother);
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Détails de la section</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Nom interne<span className="text-red-400">*</span>
            </label>
            <input required value={internalName} onChange={(e) => setInternalName(e.target.value)} className={inputClass} />
            <p className="mt-1 text-xs text-white/30">
              Un nom pour identifier cette section dans le panneau d&apos;administration. Les clients ne le verront pas.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Titre affiché<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={displayTitle}
              onChange={(e) => setDisplayTitle(e.target.value)}
              placeholder="ex : &quot;Nouveautés&quot;, &quot;Soldes d'été&quot;"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/30">Le titre que les clients verront sur la page d&apos;accueil.</p>
          </div>

          {isEdit ? (
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Slug</label>
              <input disabled value={slug} className={`${inputClass} cursor-not-allowed opacity-60`} />
              <p className="mt-1 text-xs text-white/30">Le slug d&apos;une section ne peut pas être modifié.</p>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Auto-généré depuis le titre"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-white/30">Identifiant compatible URL. Généré automatiquement depuis le titre.</p>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-white/70">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/30">Description optionnelle affichée sous le titre.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Affichage et comportement</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Type de section<span className="text-red-400">*</span>
            </label>
            <select
              value={sectionType}
              onChange={(e) => setSectionType(e.target.value as HomepageSectionFormValues["section_type"])}
              className={inputClass}
            >
              <option value="automatic" className="bg-[#12141c]">Automatique</option>
              <option value="manual" className="bg-[#12141c]">Manuel</option>
              <option value="mixed" className="bg-[#12141c]">Mixte</option>
            </select>
            <p className="mt-1 text-xs text-white/30">Le système sélectionne automatiquement les éléments selon les règles définies.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Disposition<span className="text-red-400">*</span>
            </label>
            <select
              value={displayLayout}
              onChange={(e) => setDisplayLayout(e.target.value as HomepageSectionFormValues["display_layout"])}
              className={inputClass}
            >
              <option value="horizontal_list" className="bg-[#12141c]">Liste horizontale</option>
              <option value="grid" className="bg-[#12141c]">Grille</option>
            </select>
          </div>

          {isAutomatic && (
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Stratégie automatique<span className="text-red-400">*</span>
              </label>
              <select value={automaticStrategy} onChange={(e) => setAutomaticStrategy(e.target.value)} className={inputClass}>
                <option value="new_arrivals" className="bg-[#12141c]">Nouveautés</option>
                <option value="best_sellers" className="bg-[#12141c]">Meilleures ventes</option>
                <option value="category_showcase" className="bg-[#12141c]">Vitrine de catégorie</option>
                <option value="brand_list" className="bg-[#12141c]">Liste de marques</option>
                <option value="category_list" className="bg-[#12141c]">Liste de catégories</option>
                <option value="price_range" className="bg-[#12141c]">Gamme de prix</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Mode d&apos;affichage<span className="text-red-400">*</span>
            </label>
            <select
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value as HomepageSectionFormValues["display_mode"])}
              className={inputClass}
            >
              <option value="products" className="bg-[#12141c]">Regrouper par produit</option>
              <option value="variants" className="bg-[#12141c]">Afficher les variantes (chacune séparée)</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Ordre de tri<span className="text-red-400">*</span>
            </label>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as HomepageSectionFormValues["sort_direction"])}
              className={inputClass}
            >
              <option value="asc" className="bg-[#12141c]">Croissant (A-Z, plus ancien)</option>
              <option value="desc" className="bg-[#12141c]">Décroissant (Z-A, plus récent)</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Limite d&apos;éléments<span className="text-red-400">*</span>
            </label>
            <input
              required
              type="number"
              min="1"
              value={itemLimit}
              onChange={(e) => setItemLimit(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Visibilité<span className="text-red-400">*</span>
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as HomepageSectionFormValues["visibility"])}
              className={inputClass}
            >
              <option value="everyone" className="bg-[#12141c]">Tout le monde</option>
              <option value="logged_in" className="bg-[#12141c]">Clients connectés uniquement</option>
              <option value="guests" className="bg-[#12141c]">Invités uniquement</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">URL &quot;Voir tout&quot;</label>
            <input
              value={viewAllUrl}
              onChange={(e) => setViewAllUrl(e.target.value)}
              placeholder="Généré automatiquement"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Début d&apos;affichage</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
            <p className="mt-1 text-xs text-white/30">Laisser vide pour démarrer immédiatement.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Fin d&apos;affichage</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
            <p className="mt-1 text-xs text-white/30">Laisser vide pour ne jamais expirer.</p>
          </div>

          <div className="flex items-end justify-between">
            <span className="text-sm text-white/70">Afficher le titre</span>
            <Toggle checked={showTitle} onChange={setShowTitle} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-sm text-white/70">Afficher &quot;Voir tout&quot;</span>
            <Toggle checked={showViewAll} onChange={setShowViewAll} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-sm text-white/70">Actif</span>
            <Toggle checked={isActive} onChange={setIsActive} />
          </div>
        </div>
      </div>

      {isAutomatic && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white/70">Règles automatiques</h2>
          <p className="mb-5 mt-1 text-xs text-white/30">
            Définissez des filtres pour contrôler les produits affichés pour les sections Automatique ou Mixte.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Fenêtre (jours)</label>
              <input
                type="number"
                min="1"
                value={windowDays}
                onChange={(e) => setWindowDays(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-white/30">Ignoré si la stratégie ne s&apos;en sert pas.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Prix minimum</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Prix maximum</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">En stock uniquement</span>
                <Toggle checked={inStockOnly} onChange={setInStockOnly} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Produits en promotion uniquement</span>
                <Toggle checked={campaignProductsOnly} onChange={setCampaignProductsOnly} />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Catégories</label>
              <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-2">
                {categories.length === 0 && <p className="px-2 py-1 text-xs text-white/30">Aucune catégorie.</p>}
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm text-white/70 hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(c.id)}
                      onChange={() => toggleCategory(c.id)}
                      className="accent-brand-orange"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-white/30">Laisser vide pour toutes les catégories.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Marques</label>
              <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-2">
                {brands.length === 0 && <p className="px-2 py-1 text-xs text-white/30">Aucune marque.</p>}
                {brands.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm text-white/70 hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={brandIds.includes(b.id)}
                      onChange={() => toggleBrand(b.id)}
                      className="accent-brand-orange"
                    />
                    {b.name}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-white/30">Laisser vide pour toutes les marques.</p>
            </div>
          </div>
        </div>
      )}

      {isManual && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white/70">Produits sélectionnés manuellement</h2>
          <p className="mb-5 mt-1 text-xs text-white/30">
            Recherchez des produits et ajoutez-les dans l&apos;ordre où ils doivent apparaître.
          </p>

          <div className="relative mb-4">
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className={inputClass}
            />
            {productSearch && productResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                {productResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      addItem(p);
                      setProductSearch("");
                      setProductResults([]);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <span>{p.name}</span>
                    <Plus className="h-4 w-4 text-brand-orange" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {items.length === 0 && (
              <p className="text-sm text-white/30">Aucun produit sélectionné pour l&apos;instant.</p>
            )}
            {items.map((item, index) => (
              <div
                key={item.product_id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              >
                <span className="text-sm text-white">{item.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="rounded px-2 py-1 text-xs text-white/50 hover:bg-white/10 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                    className="rounded px-2 py-1 text-xs text-white/50 hover:bg-white/10 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id)}
                    className="rounded p-1 text-red-400 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
