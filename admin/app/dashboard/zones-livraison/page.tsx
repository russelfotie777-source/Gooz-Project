"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type DeliverySettings = {
  base_fee: number;
  free_radius_km: number;
  price_per_km: number;
  free_item_count: number;
  price_per_extra_item: number;
  min_fee: number;
  max_fee: number;
  updated_at: string;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <h2 className="text-sm font-semibold text-white/70">{title}</h2>
      <p className="mb-5 mt-0.5 text-xs text-white/40">{subtitle}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-white/70">{label}</label>
      <input
        required
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      <p className="mt-1 text-xs text-white/30">{hint}</p>
    </div>
  );
}

function computeFee(settings: {
  baseFee: number;
  freeRadiusKm: number;
  pricePerKm: number;
  freeItemCount: number;
  pricePerExtraItem: number;
  minFee: number;
  maxFee: number;
}, distanceKm: number, itemCount: number): number {
  const billableDistance = Math.max(0, distanceKm - settings.freeRadiusKm);
  const extraItems = Math.max(0, itemCount - settings.freeItemCount);
  let fee = settings.baseFee + billableDistance * settings.pricePerKm + extraItems * settings.pricePerExtraItem;
  fee = Math.max(fee, settings.minFee);
  fee = Math.min(fee, settings.maxFee);
  return Math.round(fee * 100) / 100;
}

export default function ZonesLivraisonPage() {
  const [loaded, setLoaded] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [baseFee, setBaseFee] = useState("");
  const [freeRadiusKm, setFreeRadiusKm] = useState("");
  const [pricePerKm, setPricePerKm] = useState("");
  const [freeItemCount, setFreeItemCount] = useState("");
  const [pricePerExtraItem, setPricePerExtraItem] = useState("");
  const [minFee, setMinFee] = useState("");
  const [maxFee, setMaxFee] = useState("");

  const [previewDistance, setPreviewDistance] = useState("5");
  const [previewItems, setPreviewItems] = useState("2");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch<{ data: DeliverySettings }>("/admin/delivery-settings")
      .then((res) => {
        setBaseFee(String(res.data.base_fee));
        setFreeRadiusKm(String(res.data.free_radius_km));
        setPricePerKm(String(res.data.price_per_km));
        setFreeItemCount(String(res.data.free_item_count));
        setPricePerExtraItem(String(res.data.price_per_extra_item));
        setMinFee(String(res.data.min_fee));
        setMaxFee(String(res.data.max_fee));
        setUpdatedAt(res.data.updated_at);
        setLoaded(true);
      })
      .catch(() => setError("Impossible de charger la configuration de livraison."));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ data: DeliverySettings }>("/admin/delivery-settings", {
        method: "PUT",
        body: JSON.stringify({
          base_fee: Number(baseFee),
          free_radius_km: Number(freeRadiusKm),
          price_per_km: Number(pricePerKm),
          free_item_count: Number(freeItemCount),
          price_per_extra_item: Number(pricePerExtraItem),
          min_fee: Number(minFee),
          max_fee: Number(maxFee),
        }),
      });
      setUpdatedAt(res.data.updated_at);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  }

  const previewFee = loaded
    ? computeFee(
        {
          baseFee: Number(baseFee) || 0,
          freeRadiusKm: Number(freeRadiusKm) || 0,
          pricePerKm: Number(pricePerKm) || 0,
          freeItemCount: Number(freeItemCount) || 0,
          pricePerExtraItem: Number(pricePerExtraItem) || 0,
          minFee: Number(minFee) || 0,
          maxFee: Number(maxFee) || 0,
        },
        Number(previewDistance) || 0,
        Number(previewItems) || 0
      )
    : 0;

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Zones de livraison</span>
        <ChevronRight className="h-3 w-3" />
        <span>Configuration</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Zones de livraison</h1>
        <p className="mt-1 text-sm text-white/40">
          Il n&apos;existe pas de zones géographiques distinctes : le coût de livraison est calculé
          automatiquement selon la distance à vol d&apos;oiseau entre le client et l&apos;entrepôt actif le
          plus proche. Ces paramètres pilotent directement ce calcul (utilisés en temps réel au checkout).
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Configuration enregistrée. Les nouvelles commandes utiliseront ces valeurs immédiatement.
        </p>
      )}

      {!loaded ? (
        <p className="text-white/40">Chargement...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Section title="Tarification de base" subtitle="Ce que coûte une livraison avant tout calcul de distance">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Frais de base (XAF)"
                hint="Montant de départ, appliqué à chaque livraison."
                value={baseFee}
                onChange={setBaseFee}
              />
              <Field
                label="Rayon gratuit (km)"
                hint="Distance depuis l'entrepôt non facturée."
                step="0.1"
                value={freeRadiusKm}
                onChange={setFreeRadiusKm}
              />
              <Field
                label="Prix par km au-delà (XAF)"
                hint="Facturé pour chaque km au-delà du rayon gratuit."
                value={pricePerKm}
                onChange={setPricePerKm}
              />
            </div>
          </Section>

          <Section title="Articles supplémentaires" subtitle="Majoration selon la taille du panier">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Articles gratuits"
                hint="Nombre d'articles inclus sans majoration."
                value={freeItemCount}
                onChange={setFreeItemCount}
              />
              <Field
                label="Prix par article suppl. (XAF)"
                hint="Facturé pour chaque article au-delà du quota gratuit."
                value={pricePerExtraItem}
                onChange={setPricePerExtraItem}
              />
            </div>
          </Section>

          <Section title="Bornes" subtitle="Le frais final est toujours ramené entre ces deux valeurs">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Frais minimum (XAF)" hint="Jamais moins cher que ça." value={minFee} onChange={setMinFee} />
              <Field label="Frais maximum (XAF)" hint="Jamais plus cher que ça." value={maxFee} onChange={setMaxFee} />
            </div>
          </Section>

          <Section title="Simulateur" subtitle="Aperçu du frais calculé avec les valeurs ci-dessus (avant enregistrement)">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Distance (km)</label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={previewDistance}
                  onChange={(e) => setPreviewDistance(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Nombre d&apos;articles</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={previewItems}
                  onChange={(e) => setPreviewItems(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <p className="mb-1.5 text-sm text-white/70">Frais estimé</p>
                <div className="rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-3 py-2.5 text-sm font-semibold text-brand-orange">
                  {previewFee.toLocaleString("fr-FR")} XAF
                </div>
              </div>
            </div>
          </Section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
            >
              {submitting ? "..." : "Enregistrer"}
            </button>
            {updatedAt && (
              <p className="text-xs text-white/30">
                Dernière modification : {new Date(updatedAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
