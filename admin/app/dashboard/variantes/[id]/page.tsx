"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ImageOff, Pencil, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";

type VariantImage = { id: number; image_url: string; is_primary: boolean };

type Variant = {
  id: number;
  product_name: string | null;
  display_name: string | null;
  size: string | null;
  color: string | null;
  material: string | null;
  barcode: string | null;
  base_price: number;
  promo_price: number | null;
  is_promotion: boolean;
  cost_price: number | null;
  tax_rate: number | null;
  price: number;
  is_active: boolean;
  images: VariantImage[];
};

function formatXAF(value: number): string {
  return `${Number(value).toLocaleString("fr-FR")} XAF`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <h2 className="mb-5 text-sm font-semibold text-white/70">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <div className="mt-1 text-sm text-white">{children}</div>
    </div>
  );
}

export default function VariantDetailPage() {
  const params = useParams<{ id: string }>();
  const variantId = Number(params.id);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Variant }>(`/admin/variants/${variantId}`)
      .then((res) => setVariant(res.data))
      .catch(() => setError("Impossible de charger cette variante."));
  }, [variantId]);

  if (!variant) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/variantes" className="hover:text-white/70">
          Variantes de produit
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{variant.display_name ?? "Afficher"}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{variant.display_name ?? `Variante #${variant.id}`}</h1>
        <Link
          href={`/dashboard/variantes/${variant.id}/edit`}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Pencil className="h-4 w-4" />
          Modifier
        </Link>
      </div>

      <Section title="Aperçu">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Produit">{variant.product_name ?? "—"}</Field>
          <Field label="SKU / Code-barres">{variant.barcode ?? "Indisponible"}</Field>
          <Field label="Statut">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                variant.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/40"
              }`}
            >
              {variant.is_active ? "Actif" : "Inactif"}
            </span>
          </Field>
          <Field label="Taille">{variant.size ?? "—"}</Field>
          <Field label="Couleur">{variant.color ?? "—"}</Field>
          <Field label="Matière">{variant.material ?? "—"}</Field>
        </div>
      </Section>

      <Section title="Tarification">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Prix de base">{formatXAF(variant.base_price)}</Field>
          <Field label="Prix promo">{variant.promo_price ? formatXAF(variant.promo_price) : "Aucune promotion"}</Field>
          <Field label="Prix effectif">
            <span className="font-semibold text-brand-orange">{formatXAF(variant.price)}</span>
          </Field>
          <Field label="Prix de revient">{variant.cost_price ? formatXAF(variant.cost_price) : "Indisponible"}</Field>
          <Field label="TVA applicable">{variant.tax_rate ? `${variant.tax_rate} %` : "Indisponible"}</Field>
        </div>
      </Section>

      <Section title="Images">
        {variant.images.length === 0 ? (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white/5 text-white/20">
            <ImageOff className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {variant.images.map((image) => (
              <div key={image.id} className="relative h-20 w-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.image_url} alt="" className="h-20 w-20 rounded-lg object-cover ring-1 ring-white/10" />
                {image.is_primary && (
                  <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-white">
                    <Star className="h-3 w-3" fill="currentColor" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
