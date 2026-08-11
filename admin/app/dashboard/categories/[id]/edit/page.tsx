"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { CategoryForm } from "@/components/category-form";

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  is_active: boolean;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const categoryId = Number(params.id);

  const [category, setCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Category }>(`/categories/${categoryId}`)
      .then((res) => setCategory(res.data))
      .catch(() => setError("Impossible de charger cette catégorie."));
  }, [categoryId]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSubmitting(true);
    try {
      formData.append("_method", "PUT");
      await apiFetch(`/categories/${categoryId}`, { method: "POST", body: formData });
      router.push("/dashboard/categories");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/categories" className="hover:text-white/70">
          Catégories
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier Catégorie</h1>

      {category && (
        <CategoryForm
          initial={{
            name: category.name,
            slug: category.slug,
            is_active: category.is_active,
          }}
          existingImage={category.image}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
          onCancel={() => router.push("/dashboard/categories")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
