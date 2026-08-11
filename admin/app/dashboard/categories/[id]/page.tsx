"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ImageOff, Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "medium" });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <div className="mt-1 text-sm text-white">{children}</div>
    </div>
  );
}

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const categoryId = Number(params.id);
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Category }>(`/categories/${categoryId}`)
      .then((res) => setCategory(res.data))
      .catch(() => setError("Impossible de charger cette catégorie."));
  }, [categoryId]);

  if (!category) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/categories" className="hover:text-white/70">
          Catégories
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{category.name}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{category.name}</h1>
        <Link
          href={`/dashboard/categories/${category.id}/edit`}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Pencil className="h-4 w-4" />
          Modifier
        </Link>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Aperçu</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-white/40">Image</p>
            <div className="mt-1">
              {category.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-16 w-16 rounded-lg object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 text-white/20">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
          <Field label="Slug">
            <span className="rounded-md bg-amber-500/10 px-2 py-1 font-mono text-xs text-amber-400">
              {category.slug}
            </span>
          </Field>
          <Field label="Statut">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                category.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/40"
              }`}
            >
              {category.is_active ? "Actif" : "Inactif"}
            </span>
          </Field>
          <Field label="Créée le">{formatDate(category.created_at)}</Field>
          <Field label="Mise à jour le">{formatDate(category.updated_at)}</Field>
        </div>
      </div>
    </div>
  );
}
