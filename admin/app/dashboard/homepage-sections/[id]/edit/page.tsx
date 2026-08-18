"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { HomepageSectionForm, HomepageSectionFormValues } from "@/components/homepage-section-form";

type SectionDetail = {
  id: number;
  internal_name: string;
  display_title: string;
  slug: string;
  description: string | null;
  section_type: "automatic" | "manual" | "mixed";
  display_layout: "horizontal_list" | "grid";
  automatic_strategy: string | null;
  display_mode: "variants" | "products";
  sort_direction: "asc" | "desc";
  item_limit: number;
  visibility: "everyone" | "logged_in" | "guests";
  view_all_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  show_title: boolean;
  show_view_all: boolean;
  is_active: boolean;
  window_days: number | null;
  category_ids: number[];
  brand_ids: number[];
  min_price: string | null;
  max_price: string | null;
  in_stock_only: boolean;
  campaign_products_only: boolean;
  items: { id: number; position: number; product: { id: number; name: string } }[];
};

export default function EditHomepageSectionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sectionId = Number(params.id);

  const [section, setSection] = useState<SectionDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: SectionDetail }>(`/admin/homepage-sections/${sectionId}`)
      .then((res) => setSection(res.data))
      .catch(() => setError("Impossible de charger cette section."));
  }, [sectionId]);

  async function handleSubmit(values: Record<string, unknown>) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/admin/homepage-sections/${sectionId}`, { method: "PUT", body: JSON.stringify(values) });
      router.push("/dashboard/homepage-sections");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  const initial: Partial<HomepageSectionFormValues> | undefined = section
    ? {
        internal_name: section.internal_name,
        display_title: section.display_title,
        slug: section.slug,
        description: section.description ?? "",
        section_type: section.section_type,
        display_layout: section.display_layout,
        automatic_strategy: section.automatic_strategy ?? "new_arrivals",
        display_mode: section.display_mode,
        sort_direction: section.sort_direction,
        item_limit: String(section.item_limit),
        visibility: section.visibility,
        view_all_url: section.view_all_url ?? "",
        starts_at: section.starts_at ?? "",
        ends_at: section.ends_at ?? "",
        show_title: section.show_title,
        show_view_all: section.show_view_all,
        is_active: section.is_active,
        window_days: section.window_days ? String(section.window_days) : "",
        category_ids: section.category_ids,
        brand_ids: section.brand_ids,
        min_price: section.min_price ?? "",
        max_price: section.max_price ?? "",
        in_stock_only: section.in_stock_only,
        campaign_products_only: section.campaign_products_only,
        items: section.items.map((i) => ({ product_id: i.product.id, name: i.product.name })),
      }
    : undefined;

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/homepage-sections" className="hover:text-white/70">
          Sections d&apos;accueil
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier la section</h1>

      {error && !section && <p className="text-sm text-red-400">{error}</p>}

      {initial && (
        <HomepageSectionForm
          initial={initial}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
          onCancel={() => router.push("/dashboard/homepage-sections")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
