"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, ImageOff, Star, Trash2, UploadCloud } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";
import { VariantForm, ProductOption } from "@/components/variant-form";

type VariantImage = { id: number; image_url: string; is_primary: boolean };

type Variant = {
  id: number;
  product_id: number;
  name: string | null;
  size: string | null;
  color: string | null;
  material: string | null;
  barcode: string | null;
  base_price: number;
  promo_price: number | null;
  is_promotion: boolean;
  cost_price: number | null;
  tax_rate: number | null;
  is_active: boolean;
  images: VariantImage[];
};

export default function EditVariantPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const variantId = Number(params.id);

  const [variant, setVariant] = useState<Variant | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function load() {
    apiFetch<{ data: Variant }>(`/admin/variants/${variantId}`)
      .then((res) => setVariant(res.data))
      .catch(() => setError("Impossible de charger cette variante."));
  }

  useEffect(() => {
    load();
    apiFetch<Paginated<ProductOption>>("/admin/products?per_page=100")
      .then((res) => setProducts(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId]);

  async function handleSubmit(payload: Record<string, unknown>) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/variants/${variantId}`, { method: "PUT", body: JSON.stringify(payload) });
      router.push("/dashboard/variantes");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadImage(file: File | undefined | null) {
    if (!file || !variant) return;
    setImageError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("image", file);
      formData.set("product_variant_id", String(variant.id));
      if (variant.images.length === 0) formData.set("is_primary", "1");

      await apiFetch(`/products/${variant.product_id}/images`, { method: "POST", body: formData });
      load();
    } catch (err) {
      setImageError(err instanceof ApiError ? err.message : "Échec de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(imageId: number) {
    if (!confirm("Supprimer cette image ?")) return;
    try {
      await apiFetch(`/images/${imageId}`, { method: "DELETE" });
      load();
    } catch (err) {
      setImageError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/variantes" className="hover:text-white/70">
          Variantes de produit
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier la variante</h1>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {variant && (
        <>
          <VariantForm
            products={products}
            initial={{
              product_id: String(variant.product_id),
              name: variant.name ?? "",
              size: variant.size ?? "",
              color: variant.color ?? "",
              material: variant.material ?? "",
              barcode: variant.barcode ?? "",
              base_price: String(variant.base_price),
              promo_price: variant.promo_price ? String(variant.promo_price) : "",
              is_promotion: variant.is_promotion,
              cost_price: variant.cost_price ? String(variant.cost_price) : "",
              tax_rate: variant.tax_rate ? String(variant.tax_rate) : "",
              is_active: variant.is_active,
            }}
            submitting={submitting}
            error={null}
            submitLabel="Enregistrer"
            onCancel={() => router.push("/dashboard/variantes")}
            onSubmit={handleSubmit}
          />

          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <h2 className="mb-5 text-sm font-semibold text-white/70">Images</h2>

            <div className="flex flex-wrap gap-4">
              {variant.images.map((image) => (
                <div key={image.id} className="group relative h-24 w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.image_url}
                    alt=""
                    className="h-24 w-24 rounded-lg object-cover ring-1 ring-white/10"
                  />
                  {image.is_primary && (
                    <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-white">
                      <Star className="h-3 w-3" fill="currentColor" />
                    </span>
                  )}
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  uploadImage(e.dataTransfer.files?.[0]);
                }}
                className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-center transition-colors ${
                  dragOver ? "border-brand-orange bg-brand-orange/5" : "border-white/10 hover:border-white/20"
                }`}
              >
                {uploading ? (
                  <span className="text-xs text-white/40">...</span>
                ) : variant.images.length === 0 ? (
                  <ImageOff className="h-5 w-5 text-white/30" />
                ) : (
                  <UploadCloud className="h-5 w-5 text-white/30" />
                )}
                <span className="px-1 text-xs leading-tight text-brand-blue">Ajouter</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadImage(e.target.files?.[0])}
                />
              </label>
            </div>

            {imageError && <p className="mt-3 text-sm text-red-400">{imageError}</p>}
          </div>
        </>
      )}
    </div>
  );
}
