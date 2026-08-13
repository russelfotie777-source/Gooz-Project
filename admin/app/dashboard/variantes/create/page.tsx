"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";
import { VariantForm, ProductOption } from "@/components/variant-form";

export default function CreateVariantPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Paginated<ProductOption>>("/admin/products?per_page=100")
      .then((res) => setProducts(res.data))
      .catch(() => {});
  }, []);

  async function handleSubmit(payload: Record<string, unknown>) {
    setError(null);
    setSubmitting(true);
    try {
      const { product_id, ...rest } = payload;
      const created = await apiFetch<{ data: { id: number } }>(`/products/${product_id}/variants`, {
        method: "POST",
        body: JSON.stringify(rest),
      });
      router.push(`/dashboard/variantes/${created.data.id}/edit`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/variantes" className="hover:text-white/70">
          Variantes de produit
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Créer</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Créer une variante</h1>

      <VariantForm
        products={products}
        submitting={submitting}
        error={error}
        submitLabel="Créer"
        onCancel={() => router.push("/dashboard/variantes")}
        onSubmit={handleSubmit}
      />

      <p className="mt-4 text-xs text-white/30">
        Vous pourrez ajouter des images à cette variante juste après sa création.
      </p>
    </div>
  );
}
