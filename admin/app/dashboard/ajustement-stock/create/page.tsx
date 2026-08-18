"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type WarehouseOption = { id: number; name: string };
type ProductOption = { id: number; name: string };
type VariantOption = { id: number; display_name: string | null };

type LineDraft = {
  key: number;
  product_id: string;
  product_variant_id: string;
  delta_quantity: string;
  motif: string;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

let lineKeySeq = 0;
function emptyLine(): LineDraft {
  lineKeySeq += 1;
  return { key: lineKeySeq, product_id: "", product_variant_id: "", delta_quantity: "", motif: "" };
}

export default function CreateAjustementStockPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [variantsByProduct, setVariantsByProduct] = useState<Record<string, VariantOption[]>>({});

  const [warehouseId, setWarehouseId] = useState("");
  const [type, setType] = useState("rapide");
  const [motif, setMotif] = useState("");
  const [notes, setNotes] = useState("");
  const [applyNow, setApplyNow] = useState(false);
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: WarehouseOption[] }>("/admin/warehouses")
      .then((res) => setWarehouses(res.data))
      .catch(() => {});
    apiFetch<Paginated<ProductOption>>("/admin/products?per_page=100")
      .then((res) => setProducts(res.data))
      .catch(() => {});
  }, []);

  function loadVariants(productId: string) {
    if (!productId || variantsByProduct[productId]) return;
    apiFetch<Paginated<VariantOption>>(`/admin/variants?product_id=${productId}&per_page=100`)
      .then((res) => setVariantsByProduct((prev) => ({ ...prev, [productId]: res.data })))
      .catch(() => {});
  }

  function updateLine(key: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(key: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.key !== key) : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payloadLines = lines.map((line) => ({
      product_id: Number(line.product_id),
      product_variant_id: Number(line.product_variant_id),
      delta_quantity: Number(line.delta_quantity),
      motif: line.motif || null,
    }));

    if (payloadLines.some((l) => !l.product_id || !l.product_variant_id || !l.delta_quantity)) {
      setError("Chaque ligne doit avoir un produit, une variante et une quantité (≠ 0).");
      return;
    }

    setSubmitting(true);
    try {
      const created = await apiFetch<{ data: { id: number } }>("/admin/stock-adjustments", {
        method: "POST",
        body: JSON.stringify({
          warehouse_id: Number(warehouseId),
          type,
          status: applyNow ? "appliqué" : "brouillon",
          motif: motif || null,
          notes: notes || null,
          lines: payloadLines,
        }),
      });
      router.push(`/dashboard/ajustement-stock/${created.data.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/ajustement-stock" className="hover:text-white/70">
          Ajustement de stock
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Créer</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Nouvel ajustement de stock</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-sm font-semibold text-white/70">Informations générales</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                Entrepôt<span className="text-red-400">*</span>
              </label>
              <select
                required
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#12141c]">
                  Sélectionnez une option
                </option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#12141c]">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                <option value="rapide" className="bg-[#12141c]">
                  Rapide
                </option>
                <option value="inventaire" className="bg-[#12141c]">
                  Inventaire
                </option>
                <option value="correction" className="bg-[#12141c]">
                  Correction
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Motif</label>
              <input
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="ex: Casse, inventaire annuel..."
                className={inputClass}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2.5 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={applyNow}
                  onChange={(e) => setApplyNow(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
                Appliquer immédiatement (impacte le stock tout de suite)
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/70">Lignes d&apos;ajustement</h2>
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter une ligne
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {lines.map((line) => (
              <div
                key={line.key}
                className="grid grid-cols-1 gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:grid-cols-12 sm:items-end"
              >
                <div className="sm:col-span-4">
                  <label className="mb-1.5 block text-xs text-white/50">Produit</label>
                  <select
                    required
                    value={line.product_id}
                    onChange={(e) => {
                      updateLine(line.key, { product_id: e.target.value, product_variant_id: "" });
                      loadVariants(e.target.value);
                    }}
                    className={inputClass}
                  >
                    <option value="" className="bg-[#12141c]">
                      Sélectionnez
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#12141c]">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="mb-1.5 block text-xs text-white/50">Variante</label>
                  <select
                    required
                    disabled={!line.product_id}
                    value={line.product_variant_id}
                    onChange={(e) => updateLine(line.key, { product_variant_id: e.target.value })}
                    className={inputClass}
                  >
                    <option value="" className="bg-[#12141c]">
                      Sélectionnez
                    </option>
                    {(variantsByProduct[line.product_id] ?? []).map((v) => (
                      <option key={v.id} value={v.id} className="bg-[#12141c]">
                        {v.display_name ?? `#${v.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-white/50">Quantité (+/-)</label>
                  <input
                    required
                    type="number"
                    step="1"
                    value={line.delta_quantity}
                    onChange={(e) => updateLine(line.key, { delta_quantity: e.target.value })}
                    placeholder="-3 ou +10"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-white/50">Motif (ligne)</label>
                  <input
                    value={line.motif}
                    onChange={(e) => updateLine(line.key, { motif: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="flex justify-end sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length === 1}
                    className="rounded-lg p-2.5 text-red-400 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
          >
            {submitting ? "..." : "Créer"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/ajustement-stock")}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
