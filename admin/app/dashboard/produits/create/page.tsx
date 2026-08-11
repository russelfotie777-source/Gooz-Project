"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";
import { ProductForm, ProductOption } from "@/components/product-form";

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ProductOption[]>([]);
  const [brands, setBrands] = useState<ProductOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    apiFetch<Paginated<ProductOption>>("/admin/categories?per_page=100")
      .then((res) => setCategories(res.data))
      .catch(() => {});
    apiFetch<{ data: ProductOption[] }>("/brands")
      .then((res) => setBrands(res.data))
      .catch(() => {});
  }, []);

  async function handleSubmit(payload: Record<string, unknown>, addAnother: boolean) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/products", { method: "POST", body: JSON.stringify(payload) });
      if (addAnother) {
        setFormKey((k) => k + 1);
      } else {
        router.push("/dashboard/produits");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création.");
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
        <span>Créer</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Créer Produit</h1>

      <ProductForm
        key={formKey}
        categories={categories}
        brands={brands}
        submitting={submitting}
        error={error}
        showAddAnother
        submitLabel="Créer"
        onCancel={() => router.push("/dashboard/produits")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
