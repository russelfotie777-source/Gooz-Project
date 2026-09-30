"use client";

import { useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type ProductOption = { id: number; name: string };

type HomepageAdSetting = {
  flash_sacrifice_product: ProductOption | null;
  mystery_box_product: ProductOption | null;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

// One search-as-you-type product picker, reused for both slots below — same
// debounced /admin/products?q= pattern as BannerForm's own product picker.
function ProductPicker({
  label,
  hint,
  selected,
  onSelect,
  onClear,
}: {
  label: string;
  hint: string;
  selected: ProductOption | null;
  onSelect: (product: ProductOption) => void;
  onClear: () => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProductOption[]>([]);

  useEffect(() => {
    if (!search) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      apiFetch<{ data: ProductOption[] }>(`/admin/products?q=${encodeURIComponent(search)}&per_page=8`)
        .then((res) => setResults(res.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <label className="mb-1.5 block text-sm text-white/70">{label}</label>

      {selected ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
          <span className="text-sm text-white">{selected.name}</span>
          <button
            type="button"
            onClick={onClear}
            className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Retirer ce produit"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className={inputClass}
          />
          {search && results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    setSearch("");
                    setResults([]);
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

      <p className="mt-1.5 text-xs text-white/30">{hint}</p>
    </div>
  );
}

export default function HomepageAdsPage() {
  const [loaded, setLoaded] = useState(false);
  const [flashProduct, setFlashProduct] = useState<ProductOption | null>(null);
  const [boxProduct, setBoxProduct] = useState<ProductOption | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<{ data: HomepageAdSetting }>("/admin/homepage-ads")
      .then((res) => {
        setFlashProduct(res.data.flash_sacrifice_product);
        setBoxProduct(res.data.mystery_box_product);
        setLoaded(true);
      })
      .catch(() => setError("Impossible de charger les réglages."));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await apiFetch<{ data: HomepageAdSetting }>("/admin/homepage-ads", {
        method: "PUT",
        body: JSON.stringify({
          flash_sacrifice_product_id: flashProduct?.id ?? null,
          mystery_box_product_id: boxProduct?.id ?? null,
        }),
      });
      setFlashProduct(res.data.flash_sacrifice_product);
      setBoxProduct(res.data.mystery_box_product);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Paramètres</span>
        <ChevronRight className="h-3 w-3" />
        <span>Bannières pub accueil</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bannières pub accueil</h1>
        <p className="mt-1 text-sm text-white/40">
          Les deux cartes affichées à côté du carrousel principal sur la page d&apos;accueil (desktop). Choisis quel
          produit chacune met en avant — sans sélection, le site retombe automatiquement sur un produit en
          promotion (ou le premier produit disponible).
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {!loaded ? (
        <p className="text-white/40">Chargement...</p>
      ) : (
        <div className="flex flex-col gap-6">
          <ProductPicker
            label="Produit à liquider (carte « Sacrifice de minuit »)"
            hint="Sa photo apparaît assombrie sous le badge « ? », et s'éclaircit au survol. Le bouton de la carte renvoie vers sa fiche produit."
            selected={flashProduct}
            onSelect={setFlashProduct}
            onClear={() => setFlashProduct(null)}
          />

          <ProductPicker
            label="Produit de la box mystère (carte « Crate mystère »)"
            hint="Optionnel — la carte fonctionne déjà sans produit choisi, comme une simple promo générique."
            selected={boxProduct}
            onSelect={setBoxProduct}
            onClear={() => setBoxProduct(null)}
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
            >
              {saving ? "..." : "Enregistrer"}
            </button>
            {saved && <span className="text-sm text-emerald-400">Enregistré.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
