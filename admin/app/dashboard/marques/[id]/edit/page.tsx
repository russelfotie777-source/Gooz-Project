"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { BrandForm } from "@/components/brand-form";

type Brand = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  country_origin: string | null;
  is_active: boolean;
};

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const brandId = Number(params.id);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Brand }>(`/brands/${brandId}`)
      .then((res) => setBrand(res.data))
      .catch(() => setError("Impossible de charger cette marque."));
  }, [brandId]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSubmitting(true);
    try {
      formData.append("_method", "PUT");
      await apiFetch(`/brands/${brandId}`, { method: "POST", body: formData });
      router.push("/dashboard/marques");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/marques" className="hover:text-white/70">
          Marques
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier Marque</h1>

      {brand && (
        <BrandForm
          initial={{
            name: brand.name,
            slug: brand.slug,
            country_origin: brand.country_origin ?? "",
            description: brand.description ?? "",
            is_active: brand.is_active,
          }}
          existingLogo={brand.logo}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
          onCancel={() => router.push("/dashboard/marques")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
