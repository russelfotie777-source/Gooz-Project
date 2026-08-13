"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";
import { ProductForm, ProductOption } from "@/components/product-form";

type Product = {
  id: number;
  name: string;
  description: string | null;
  reference: string | null;
  is_active: boolean;
  category: { id: number } | null;
  brand: { id: number } | null;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<ProductOption[]>([]);
  const [brands, setBrands] = useState<ProductOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Product }>(`/admin/products/${productId}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError("Impossible de charger ce produit."));
    apiFetch<Paginated<ProductOption>>("/admin/categories?per_page=100")
      .then((res) => setCategories(res.data))
      .catch(() => {});
    apiFetch<{ data: ProductOption[] }>("/brands")
      .then((res) => setBrands(res.data))
      .catch(() => {});
  }, [productId]);

  async function handleSubmit(payload: Record<string, unknown>) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/products/${productId}`, { method: "PUT", body: JSON.stringify(payload) });
      router.push("/dashboard/produits");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/produits" className="hover:text-white/70">
          Produits
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier Produit</h1>

      {product && (
        <ProductForm
          categories={categories}
          brands={brands}
          initial={{
            name: product.name,
            category_id: product.category ? String(product.category.id) : "",
            brand_id: product.brand ? String(product.brand.id) : "",
            reference: product.reference ?? "",
            is_active: product.is_active,
            description: product.description ?? "",
          }}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
          onCancel={() => router.push("/dashboard/produits")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
