"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { BannerForm, BannerFormValues } from "@/components/banner-form";

type BannerDetail = {
  id: number;
  title: string | null;
  description: string | null;
  image: string;
  link_type: "external" | "product";
  link_url: string | null;
  product: { id: number; name: string } | null;
  location: "homepage" | "category" | "search" | "checkout";
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const bannerId = Number(params.id);

  const [banner, setBanner] = useState<BannerDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: BannerDetail }>(`/admin/banners/${bannerId}`)
      .then((res) => setBanner(res.data))
      .catch(() => setError("Impossible de charger cette bannière."));
  }, [bannerId]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSubmitting(true);
    try {
      formData.append("_method", "PUT");
      await apiFetch(`/banners/${bannerId}`, { method: "POST", body: formData });
      router.push("/dashboard/bannieres");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  const initial: Partial<BannerFormValues> | undefined = banner
    ? {
        title: banner.title ?? "",
        description: banner.description ?? "",
        link_type: banner.link_type,
        link_url: banner.link_url ?? "",
        product_id: banner.product?.id ?? null,
        product_name: banner.product?.name ?? "",
        location: banner.location,
        starts_at: banner.starts_at ?? "",
        ends_at: banner.ends_at ?? "",
        is_active: banner.is_active,
      }
    : undefined;

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/bannieres" className="hover:text-white/70">
          Bannières
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier la bannière</h1>

      {error && !banner && <p className="text-sm text-red-400">{error}</p>}

      {banner && initial && (
        <BannerForm
          initial={initial}
          existingImage={banner.image}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
          onCancel={() => router.push("/dashboard/bannieres")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
